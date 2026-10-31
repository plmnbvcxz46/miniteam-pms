/**
 * 统计报表模块纯函数：接口字段 → 展示文案与图表比例换算
 */
import type { ReportSummary } from "../../types/reports";

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
 * 0-1 的比率转为百分比整数文案（如 0.4286 → "43%"）
 */
export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * 两位补零的周次文案（如 5, 10 → "05/10"）
 */
export function formatWeekNo(weekNo: number, totalWeeks: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(weekNo)}/${pad(totalWeeks)}`;
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
  if (delayDays < 0) return `提前 ${Math.abs(delayDays)} 天`;
  return "按计划";
}

/**
 * 计算成员工时条各段百分比及动效参数
 * 默认上限 40 小时位于 80% 刻度处（基准坐标轴 50 小时）
 */
export function calculateLoadBar(
  hours: number,
  capacity = 40,
  maxScale = 50,
): {
  capPercent: number;
  fillPercent: number;
  fillDur: string;
  overPercent: number;
  overLeftPercent: number;
  overDelay: string;
  overDur: string;
  isOver: boolean;
} {
  const safeCap = Math.max(capacity, 1);
  const safeMax = Math.max(maxScale, safeCap);

  const main = Math.min(hours, safeCap);
  const over = Math.max(0, hours - safeCap);

  const capPercent = (safeCap / safeMax) * 100;
  const fillPercent = (main / safeMax) * 100;
  const fillDur = ((main / safeMax) * 0.6).toFixed(2);

  const overPercent = (over / safeMax) * 100;
  const overLeftPercent = capPercent;
  const overDelay = ((safeCap / safeMax) * 0.6).toFixed(2);
  const overDur = ((over / safeMax) * 0.6).toFixed(2);

  return {
    capPercent,
    fillPercent,
    fillDur,
    overPercent,
    overLeftPercent,
    overDelay,
    overDur,
    isOver: over > 0,
  };
}

/**
 * 计算工期偏差图条的宽度百分比与动效参数
 * 基准天数 maxDays 默认为 8 天
 */
export function calculateDeviationBar(
  planDays: number,
  actualDays: number,
  deviationDays: number,
  maxDays = 8,
): {
  planWidthPercent: number;
  planDur: number;
  actualWidthPercent: number;
  actualDur: number;
  overWidthPercent: number;
  overDur: number;
  isOver: boolean;
} {
  const DU = 0.09;
  const safeMax = Math.max(maxDays, 1);

  const planWidthPercent = Math.min(100, (planDays / safeMax) * 100);
  const planDur = Number((planDays * DU).toFixed(2));

  const actualWidthPercent = Math.min(100, (actualDays / safeMax) * 100);
  const actualDur = Number((actualDays * DU).toFixed(2));

  const overDays = Math.max(0, deviationDays);
  const overWidthPercent = Math.min(100 - actualWidthPercent, (overDays / safeMax) * 100);
  const overDur = Number((overDays * DU).toFixed(2));

  return {
    planWidthPercent,
    planDur,
    actualWidthPercent,
    actualDur,
    overWidthPercent,
    overDur,
    isOver: deviationDays > 0,
  };
}
