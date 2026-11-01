import type { TaskStatus } from "../../types/global";
import type { TaskDetail } from "../../types/task";
import { applyTaskStatus } from "./task/utils";

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
