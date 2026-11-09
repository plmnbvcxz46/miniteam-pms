import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { TaskStatus } from "../../shared/types/global";

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
  startX: number;
  startY: number;
  rect: DOMRect;
  target: DropTarget;
}

/** 鼠标所在的列和插入位置，不在任何列上时返回 null */
function findDropTarget(x: number, y: number): DropTarget | null {
  const drop = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>(".drop[data-status]");
  if (!drop) return null;

  const cards = [...drop.querySelectorAll(".card")];
  const before = cards.findIndex((card) => {
    const rect = card.getBoundingClientRect();
    return y < rect.top + rect.height / 2;
  });
  return {
    status: drop.dataset.status as TaskStatus,
    index: before === -1 ? cards.length : before,
  };
}

/**
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

  useEffect(() => {
    const update = (next: CardDrag | null) => {
      dragRef.current = next;
      setDrag(next);
    };

    const handleMove = (e: globalThis.PointerEvent) => {
      const press = pressRef.current;
      if (!press) return;
      const moved =
        Math.abs(e.clientX - press.startX) + Math.abs(e.clientY - press.startY);
      if (!dragRef.current && moved < DRAG_THRESHOLD) return;

      document.body.classList.add("dragging");
      const found = findDropTarget(e.clientX, e.clientY);
      update({
        taskId: press.taskId,
        width: press.rect.width,
        height: press.rect.height,
        left: press.rect.left + e.clientX - press.startX,
        top: press.rect.top + e.clientY - press.startY,
        target: !found
          ? (dragRef.current?.target ?? press.target)
          : canDrop(press.taskId, found.status)
            ? found
            : press.target,
      });
    };

    const finish = (cancel: boolean) => {
      const current = dragRef.current;
      pressRef.current = null;
      if (!current) return;
      document.body.classList.remove("dragging");
      draggedRef.current = true;
      update(null);
      if (!cancel) onDrop(current.taskId, current.target);
    };

    const handleUp = () => finish(false);
    const handleCancel = () => finish(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(true);
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("pointercancel", handleCancel);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleCancel);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onDrop, canDrop]);

  // 离开页面时清掉拖动中的全局样式
  useEffect(() => () => document.body.classList.remove("dragging"), []);

  const handlePress = (
    e: PointerEvent<HTMLElement>,
    taskId: number,
    target: DropTarget,
  ) => {
    if (e.button !== 0) return;
    draggedRef.current = false;
    pressRef.current = {
      taskId,
      startX: e.clientX,
      startY: e.clientY,
      rect: e.currentTarget.getBoundingClientRect(),
      target,
    };
  };

  /** 拖动结束后浏览器可能补发一次 click，用它区分真正的点击 */
  const wasDragged = () => draggedRef.current;

  return { drag, handlePress, wasDragged };
}
