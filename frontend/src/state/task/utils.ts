import type { TaskStatus } from "../../shared/types/global";
import type { TaskDetail } from "../../shared/types/task";
import { applyTaskStatus } from "../../pages/task/utils";

/** 某一列的任务，按列内顺序排列 */
export function getColumnTasks(
  tasks: Record<number, TaskDetail>,
  status: TaskStatus,
): TaskDetail[] {
  return Object.values(tasks)
    .filter((task) => task.status === status)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 把任务移到目标列的第 index 位，返回新的任务表 */
export function moveTaskTo(
  tasks: Record<number, TaskDetail>,
  taskId: number,
  status: TaskStatus,
  index: number,
  today: string,
): Record<number, TaskDetail> {
  const moved =
    tasks[taskId].status === status
      ? tasks
      : applyTaskStatus(tasks, taskId, status, today);

  const ids = getColumnTasks(moved, status)
    .map((task) => task.id)
    .filter((id) => id !== taskId);
  ids.splice(index, 0, taskId);

  const next = { ...moved };
  ids.forEach((id, sortOrder) => {
    next[id] = { ...next[id], sortOrder };
  });
  return next;
}

/**
 * 列里有些任务被隐藏时，把“在可见卡片里的第几位”换算成“在整列里的第几位”，
 * 这样落在末尾就还是整列的末尾
 */
export function toFullIndex(
  tasks: Record<number, TaskDetail>,
  movedId: number,
  target: { status: TaskStatus; index: number },
  isShown: (task: TaskDetail) => boolean,
): number {
  const column = getColumnTasks(tasks, target.status).filter(
    (task) => task.id !== movedId,
  );
  const before = column.filter(isShown)[target.index];
  return before ? column.findIndex((task) => task.id === before.id) : column.length;
}

/** 被阻塞任务拖住、还没完成的后续任务，去重 */
export function getBlockedTasks(
  tasks: Record<number, TaskDetail>,
): TaskDetail[] {
  const ids = getColumnTasks(tasks, "BLOCKED").flatMap((task) =>
    task.successors
      .filter((dep) => dep.status !== "DONE")
      .map((dep) => dep.task.id),
  );
  return [...new Set(ids)].map((id) => tasks[id]);
}

/** 前置任务的可选项：未完成的任务加已选的，排除自身和下游任务以免成环 */
export function getPredecessorOptions(
  tasks: Record<number, TaskDetail>,
  task: TaskDetail | null,
): TaskDetail[] {
  const excluded = new Set<number>();
  const collect = (id: number) => {
    if (excluded.has(id)) return;
    excluded.add(id);
    tasks[id].successors.forEach((dep) => collect(dep.task.id));
  };
  if (task) collect(task.id);

  const selected = task?.predecessors.map((dep) => dep.task.id) ?? [];
  return Object.values(tasks).filter(
    (item) =>
      !excluded.has(item.id) &&
      (item.status !== "DONE" || selected.includes(item.id)),
  );
}
