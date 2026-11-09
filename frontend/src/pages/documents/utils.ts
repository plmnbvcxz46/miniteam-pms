import type {
  BoundDocument,
  DocumentItem,
} from "../../shared/types/documents";
import {
  addDays,
  formatDayLabel,
  getProjectToday,
  pad2,
  toDay,
} from "../../shared/utils/date";

/**
 * 时间跨度（天数）
 */
export const DSPAN = 21;

/** 时间轴起点在今天前面几天，今天落在轴上约一半的位置 */
const AXIS_DAYS_BEFORE_TODAY = 10;

/** 时间轴起点 yyyy-MM-dd，跟着项目的今天走 */
function getAxisStart(): string {
  return addDays(getProjectToday(), -AXIS_DAYS_BEFORE_TODAY);
}

/** 时间轴上的刻度（MM.DD），每 7 天一个，覆盖整条轴 */
export function getAxisDates(): string[] {
  const start = getAxisStart();
  return Array.from({ length: Math.ceil(DSPAN / 7) }, (_, i) =>
    formatDayLabel(addDays(start, i * 7)),
  );
}

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
    return `${year}-${pad2(m)}-${pad2(d)}`;
  };
  return toDay(toDate(str)) - toDay(getAxisStart());
}

/** 没有所属任务的文档，页面上写“项目文档” */
export function withTaskTitle(doc: DocumentItem): BoundDocument {
  return { ...doc, taskTitle: doc.taskTitle ?? "项目文档" };
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

  // 没有截止日（没绑任务、也没填）的文档不会逾期
  if (!doc.due) {
    return { status: "修订中", isLate: false, lateDays: 0 };
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
