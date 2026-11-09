import type {
  BoundDocument,
  DocumentItem,
} from "../../shared/types/documents";
import {
  addDays,
  formatDayLabel,
  pad2,
  toDay,
} from "../../shared/utils/date";

/**
 * 时间跨度（天数）
 */
export const DSPAN = 21;

/** 时间轴起点在今天前面几天，今天落在轴上约一半的位置 */
const AXIS_DAYS_BEFORE_TODAY = 10;

/** 时间轴起点 yyyy-MM-dd，跟着今天走 */
function getAxisStart(today: string): string {
  return addDays(today, -AXIS_DAYS_BEFORE_TODAY);
}

/** 时间轴上的刻度（MM.DD），每 7 天一个，覆盖整条轴。today 是 yyyy-MM-dd */
export function getAxisDates(today: string): string[] {
  const start = getAxisStart(today);
  return Array.from({ length: Math.ceil(DSPAN / 7) }, (_, i) =>
    formatDayLabel(addDays(start, i * 7)),
  );
}

/** MM.DD 补上年份，取离今天最近的那一年，跨年时 12.30 和 01.02 都能对上 */
function toFullDate(md: string, today: string): string {
  const [m, d] = md.split(/[.-]/).map(Number);
  const year = Number(today.slice(0, 4));
  const candidates = [year - 1, year, year + 1].map((y) => `${y}-${pad2(m)}-${pad2(d)}`);
  const base = toDay(today);
  return candidates.reduce((best, c) =>
    Math.abs(toDay(c) - base) < Math.abs(toDay(best) - base) ? c : best,
  );
}

/** MM.DD 日期相对时间轴起点的天数。today 是 yyyy-MM-dd */
export function getDayOffset(md: string, today: string): number {
  if (!md) return 0;
  return toDay(toFullDate(md, today)) - toDay(getAxisStart(today));
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
  today: string,
): DocStatusInfo {
  if (doc.final) {
    return { status: "定稿", isLate: false, lateDays: 0 };
  }

  // 没有截止日（没绑任务、也没填）的文档不会逾期
  if (!doc.due) {
    return { status: "修订中", isLate: false, lateDays: 0 };
  }

  const currentOffset = getDayOffset(formatDayLabel(today), today);
  const dueOffset = getDayOffset(doc.due, today);

  if (currentOffset > dueOffset) {
    const diff = currentOffset - dueOffset;
    return { status: `逾期 ${diff} 天`, isLate: true, lateDays: diff };
  }

  if (currentOffset === dueOffset) {
    return { status: "今天截止", isLate: false, lateDays: 0 };
  }

  return { status: "修订中", isLate: false, lateDays: 0 };
}
