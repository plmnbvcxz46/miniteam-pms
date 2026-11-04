import type { TaskStatus } from "../../../types/global";
import type {
  DependencyTask,
  DocumentBrief,
  TaskDetail,
} from "../../../types/task";

import { DAY_MS, daysBetween, formatMonthDay } from "../../../utils/date";

/** 操作记录时间：今天只显示时分，昨天显示“昨天”，更早显示月日 */
export function formatLogTime(createdAt: string, today: string): string {
  const [date, time = ""] = createdAt.split(" ");
  const clock = time.slice(0, 5);
  const daysAgo = daysBetween(date, today);
  if (daysAgo === 0) return clock;
  if (daysAgo === 1) return `昨天 ${clock}`;
  return `${formatMonthDay(date)} ${clock}`;
}

/** 文档状态文案 */
export function formatDocStatus(doc: DocumentBrief): string {
  if (doc.overdueDays > 0) return `逾期 ${doc.overdueDays} 天`;
  return doc.status === "FINAL" ? "定稿" : "修订中";
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
