import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent,
} from "react";
import type { TaskStatus } from "../../../shared/types/global";

/** 移动超过这个距离才算拖动，否则按点击处理 */
const DRAG_THRESHOLD = 5;

export interface DropTarget {
  status: TaskStatus;
  index: number;
}

export interface CardDrag {
  taskId: number;
  width: number;
  height: number;
  left: number;
  top: number;
  target: DropTarget;
}

interface Press {
  taskId: number;
  pointerId: number;
  captureEl: HTMLElement | null;
  boardEl: HTMLElement | null;
  startX: number;
  startY: number;
  rect: DOMRect;
  target: DropTarget;
}

/** 鼠标所在的列和插入位置，不在任何列上时返回 null */
function findDropTarget(x: number, y: number): DropTarget | null {
  const drop = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>("[data-drop-zone][data-status]");
  if (!drop) return null;

  const cards = [...drop.querySelectorAll("[data-drag-card]")];
  const before = cards.findIndex((card) => {
    const rect = card.getBoundingClientRect();
    return y < rect.top + rect.height / 2;
  });
  return {
    status: drop.dataset.status as TaskStatus,
    index: before === -1 ? cards.length : before,
  };
}

function setDraggingCursor(active: boolean) {
  if (active) {
    document.body.dataset.cardDragging = "true";
    document.body.style.cursor = "grabbing";
  } else {
    delete document.body.dataset.cardDragging;
    document.body.style.cursor = "";
  }
}

function trySetCapture(el: HTMLElement | null, pointerId: number) {
  try {
    el?.setPointerCapture?.(pointerId);
  } catch {
    // 指针已失效或节点不可捕获时忽略
  }
}

function tryReleaseCapture(el: HTMLElement | null, pointerId: number) {
  try {
    if (el?.hasPointerCapture?.(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
  } catch {
    // 捕获已释放或节点已卸载时忽略
  }
}

function scheduleDraggedReset(
  draggedRef: MutableRefObject<boolean>,
  timerRef: MutableRefObject<number | undefined>,
) {
  window.clearTimeout(timerRef.current);
  timerRef.current = window.setTimeout(() => {
    draggedRef.current = false;
    timerRef.current = undefined;
  }, 0);
}

function buildNextDrag(
  press: Press,
  prev: CardDrag | null,
  clientX: number,
  clientY: number,
  canDrop: (taskId: number, status: TaskStatus) => boolean,
): CardDrag {
  const found = findDropTarget(clientX, clientY);
  return {
    taskId: press.taskId,
    width: press.rect.width,
    height: press.rect.height,
    left: press.rect.left + clientX - press.startX,
    top: press.rect.top + clientY - press.startY,
    target: !found
      ? (prev?.target ?? press.target)
      : canDrop(press.taskId, found.status)
        ? found
        : press.target,
  };
}

function bindDocumentDrag(deps: {
  pressRef: MutableRefObject<Press | null>;
  dragRef: MutableRefObject<CardDrag | null>;
  draggedRef: MutableRefObject<boolean>;
  resetTimerRef: MutableRefObject<number | undefined>;
  update: (next: CardDrag | null) => void;
  onDrop: (taskId: number, target: DropTarget) => void;
  canDrop: (taskId: number, status: TaskStatus) => boolean;
}): () => void {
  const finish = (cancel: boolean) => {
    const press = deps.pressRef.current;
    const current = deps.dragRef.current;
    deps.pressRef.current = null;
    if (press) tryReleaseCapture(press.captureEl, press.pointerId);
    if (!current) return;
    setDraggingCursor(false);
    deps.draggedRef.current = true;
    // 落点在源卡片外时浏览器不会补发 click，同轮微/宏任务后自动复位标记避免误拦后续打开
    scheduleDraggedReset(deps.draggedRef, deps.resetTimerRef);
    deps.update(null);
    if (!cancel) deps.onDrop(current.taskId, current.target);
  };

  const handleMove = (e: globalThis.PointerEvent) => {
    const press = deps.pressRef.current;
    if (!press || e.pointerId !== press.pointerId) return;
    const moved =
      Math.abs(e.clientX - press.startX) + Math.abs(e.clientY - press.startY);
    if (!deps.dragRef.current && moved < DRAG_THRESHOLD) return;

    // 源卡片即将从列内移除，提前把捕获切到常驻的看板容器，避免拖出窗口外丢指针
    if (!deps.dragRef.current && press.boardEl && press.captureEl !== press.boardEl) {
      press.captureEl = press.boardEl;
      trySetCapture(press.boardEl, press.pointerId);
    }

    setDraggingCursor(true);
    deps.update(buildNextDrag(press, deps.dragRef.current, e.clientX, e.clientY, deps.canDrop));
  };

  const entries: ReadonlyArray<readonly [string, EventListener]> = [
    ["pointermove", handleMove as EventListener],
    ["pointerup", ((e: globalThis.PointerEvent) => {
      if (deps.pressRef.current?.pointerId === e.pointerId) finish(false);
    }) as EventListener],
    ["pointercancel", ((e: globalThis.PointerEvent) => {
      if (deps.pressRef.current?.pointerId === e.pointerId) finish(true);
    }) as EventListener],
    ["lostpointercapture", ((e: globalThis.PointerEvent) => {
      const press = deps.pressRef.current;
      if (press && e.pointerId === press.pointerId && e.target === press.captureEl) {
        finish(true);
      }
    }) as EventListener],
    ["keydown", ((e: KeyboardEvent) => {
      if (e.key === "Escape") finish(true);
    }) as EventListener],
  ];

  for (const [type, listener] of entries) document.addEventListener(type, listener);
  return () => {
    for (const [type, listener] of entries) document.removeEventListener(type, listener);
  };
}

/**
 * 看板卡片指针拖拽 hook
 * @param canDrop 能不能放进某一列；不能放的列上，占位留在原处，松手等于没拖
 */
export function useCardDrag(
  onDrop: (taskId: number, target: DropTarget) => void,
  canDrop: (taskId: number, status: TaskStatus) => boolean = () => true,
) {
  const [drag, setDrag] = useState<CardDrag | null>(null);
  const pressRef = useRef<Press | null>(null);
  const dragRef = useRef<CardDrag | null>(null);
  const draggedRef = useRef(false);
  const resetTimerRef = useRef<number | undefined>(undefined);

  useEffect(
    () =>
      bindDocumentDrag({
        pressRef,
        dragRef,
        draggedRef,
        resetTimerRef,
        update: (next) => {
          dragRef.current = next;
          setDrag(next);
        },
        onDrop,
        canDrop,
      }),
    [onDrop, canDrop],
  );

  useEffect(() => {
    const timer = resetTimerRef;
    return () => {
      window.clearTimeout(timer.current);
      setDraggingCursor(false);
    };
  }, []);

  const handlePress = (
    e: PointerEvent<HTMLElement>,
    taskId: number,
    target: DropTarget,
  ) => {
    if (e.button !== 0 || pressRef.current !== null) return;
    window.clearTimeout(resetTimerRef.current);
    draggedRef.current = false;
    const cardEl = e.currentTarget;
    trySetCapture(cardEl, e.pointerId);
    pressRef.current = {
      taskId,
      pointerId: e.pointerId,
      captureEl: cardEl,
      boardEl: cardEl.closest<HTMLElement>('[data-view="board"]'),
      startX: e.clientX,
      startY: e.clientY,
      rect: cardEl.getBoundingClientRect(),
      target,
    };
  };

  /** 拖动结束后浏览器可能补发一次 click，用它区分真正的点击 */
  const wasDragged = () => draggedRef.current;

  return { drag, handlePress, wasDragged };
}
