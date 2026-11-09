import type { TaskStatus } from "../../shared/types/global";
import type { DependencyTask, TaskDetail } from "../../shared/types/task";
import { DAY_MS, daysBetween } from "../../shared/utils/date";

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

/** 从开始日到今天（含）经过的工作日数 */
function countWorkdays(start: string, today: string): number {
  let count = 0;
  for (
    let time = Date.parse(start);
    time <= Date.parse(today);
    time += DAY_MS
  ) {
    const weekday = new Date(time).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count++;
  }
  return count;
}

function getUsedDays(
  task: TaskDetail,
  status: TaskStatus,
  today: string,
): number {
  if (status === "DONE") return task.planDays;
  if (status === "TODO" || !task.planStart) return 0;
  return countWorkdays(task.planStart, today);
}

function getOverdueDays(
  task: TaskDetail,
  status: TaskStatus,
  today: string,
): number {
  if (status === "DONE" || !task.dueDate) return 0;
  return Math.max(0, daysBetween(task.dueDate, today));
}

/**
 * 修改任务状态后的任务表：重算本任务的已用和逾期天数，
 * 并同步其他任务前置 / 后续列表里的状态。接通接口后由后端返回，这里可删除
 */
export function applyTaskStatus(
  tasks: Record<number, TaskDetail>,
  taskId: number,
  status: TaskStatus,
  today: string,
): Record<number, TaskDetail> {
  const syncStatus = (deps: DependencyTask[]) =>
    deps.map((dep) => (dep.task.id === taskId ? { ...dep, status } : dep));

  return Object.fromEntries(
    Object.values(tasks).map((task) => {
      const synced = {
        ...task,
        predecessors: syncStatus(task.predecessors),
        successors: syncStatus(task.successors),
      };
      if (task.id !== taskId) return [task.id, synced];
      return [
        task.id,
        {
          ...synced,
          status,
          // 移到已完成时记下完成日，任务条要用它画完成标记
          actualEnd: status === "DONE" ? (task.actualEnd ?? today) : null,
          usedDays: getUsedDays(task, status, today),
          overdueDays: getOverdueDays(task, status, today),
        },
      ];
    }),
  );
}
