import type { BoundDocument, DocumentItem } from "../../types/documents";
import type { DocumentBrief, TaskDetail } from "../../types/task";
import { formatDayLabel, getProjectToday, toDay } from "../../utils/date";

/**
 * 时间跨度（天数）
 */
export const DSPAN = 21;

/** 时间轴起点 MM-DD，和 DocumentRevising 的第一个刻度 10.12 对齐 */
const AXIS_START = "10-12";

/** 文档页的“今天”，MM.DD */
export function getDocToday(): string {
  return formatDayLabel(getProjectToday());
}

/**
 * 将 "MM.DD" 或 "MM-DD" 日期字符串转换为相对于时间轴起点（10.12）的天数偏移量，年份取项目所在年
 */
export function getDayOffset(str: string): number {
  if (!str) return 0;
  const year = getProjectToday().slice(0, 4);
  const toDate = (md: string) => {
    const [m, d] = md.split(/[.-]/).map(Number);
    return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };
  return toDay(toDate(str)) - toDay(toDate(AXIS_START));
}

/**
 * 文档绑定了任务时，截止日跟随任务截止日；没绑任务的文档用自己的 due。
 * 是否定稿是文档自己的状态，可以早于任务完成，不跟随任务
 */
export function bindDocToTask(
  doc: DocumentItem,
  taskMap: Record<number, TaskDetail>,
): BoundDocument {
  const task = doc.taskId === undefined ? undefined : taskMap[doc.taskId];
  if (!task) return { ...doc, taskTitle: "项目文档" };
  return {
    ...doc,
    taskTitle: task.title,
    due: task.dueDate ? formatDayLabel(task.dueDate) : doc.due,
  };
}

/** 任务详情里的文档简要信息：已逾期天数按任务截止日算 */
export function toDocumentBrief(
  doc: DocumentItem,
  task: TaskDetail,
  today: string,
): DocumentBrief {
  const overdue =
    !doc.final && task.dueDate
      ? Math.max(0, Math.round(toDay(today) - toDay(task.dueDate)))
      : 0;
  return {
    id: doc.id,
    name: doc.n,
    currentVersion: doc.v,
    status: doc.final ? "FINAL" : "REVISING",
    overdueDays: overdue,
  };
}

/**
 * 将天数偏移量转换为甘特图轨道上的百分比位置字符串
 */
export function getTimelinePercent(n: number): string {
  return ((Math.max(0, Math.min(DSPAN, n)) / DSPAN) * 100).toFixed(2) + "%";
}

/**
 * 文档状态计算结果
 */
export interface DocStatusInfo {
  status: string; // 状态文案："定稿" | "逾期 X 天" | "今天截止" | "修订中"
  isLate: boolean; // 是否逾期
  lateDays: number; // 逾期天数（非逾期为 0）
}

/**
 * 根据文档定稿标志、截止日期与当前日期动态计算文档状态
 */
export function getDocStatus(
  doc: { final?: boolean; due: string },
  currentDate = getDocToday()
): DocStatusInfo {
  if (doc.final) {
    return { status: "定稿", isLate: false, lateDays: 0 };
  }

  const currentOffset = getDayOffset(currentDate);
  const dueOffset = getDayOffset(doc.due);

  if (currentOffset > dueOffset) {
    const diff = currentOffset - dueOffset;
    return { status: `逾期 ${diff} 天`, isLate: true, lateDays: diff };
  }

  if (currentOffset === dueOffset) {
    return { status: "今天截止", isLate: false, lateDays: 0 };
  }

  return { status: "修订中", isLate: false, lateDays: 0 };
}
