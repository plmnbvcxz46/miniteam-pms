/**
 * 统计报表模块纯函数：接口字段 → 展示文案与图表比例换算
 */
import type { ReportSummary } from "../../shared/types/reports";
import { formatWeekNo } from "../../shared/utils/date";

/**
 * 将 yyyy-MM-dd 截取为 M.DD 或 M.D（如 "2026-11-27" → "11.27"，"2026-12-01" → "12.1"）
 * @param preserveZero 是否保留日期的两位补零，默认保留（例如 12.01）；传 false 则输出 12.1（用于 Forecast 大字展示）
 */
export function toMonthDay(date: string, preserveZero = true): string {
  if (!date) return "";
  const match = date.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!match) return date;
  const month = parseInt(match[1], 10);
  const day = preserveZero ? match[2] : String(parseInt(match[2], 10));
  return `${month}.${day}`;
}

/**
 * 格式化顶部 Kicker 文案
 */
export function formatKicker(summary: ReportSummary): string {
  const week = formatWeekNo(summary.weekNo, summary.totalWeeks);
  return `第 ${week} 周 · 已完成 ${summary.done} / ${summary.total} 项 · 剩余 ${summary.remaining} 项`;
}

/**
 * 格式化延期天数文案
 */
export function formatDelayText(delayDays: number): string {
  if (delayDays > 0) return `晚 ${delayDays} 天`;
  if (delayDays < 0) return `早 ${Math.abs(delayDays)} 天`;
  return "按计划";
}
