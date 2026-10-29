/**
 * 时间跨度（天数）
 */
export const DSPAN = 21;

/**
 * 将 "MM.DD" 日期字符串转换为相对于基准日（10.12）的天数偏移量
 */
export function getDayOffset(str: string): number {
  const p = str.split(".");
  const m = +p[0];
  const d = +p[1];
  return m === 9 ? d - 42 : m === 10 ? d - 12 : d + 19;
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
  currentDate = "10.22"
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
