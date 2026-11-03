/**
 * 统计报表模块纯函数：接口字段 → 展示文案与图表比例换算
 */
import type {
  DurationDeviation,
  ReportSummary,
  WeeklyCompleted,
  Workload,
} from "../../types/reports";
import { formatWeekNo } from "../../utils/date";
import type { XlsxCell } from "../../utils/xlsx";

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

/** 导出表格每一列的宽度 */
export const REPORT_SHEET_WIDTHS = [18, 12, 12, 12, 12];

/**
 * 把报表页上的数据排成一张表（一行一个数组，空字符串是空格子）。
 * 接口接通后由 GET /projects/{projectId}/reports/export 直接返回 Excel，这里只是替身
 */
export function buildReportRows(data: {
  summary: ReportSummary;
  workload: Workload;
  weeklyCompleted: WeeklyCompleted[];
  deviations: DurationDeviation[];
}): XlsxCell[][] {
  const { summary, workload, weeklyCompleted, deviations } = data;
  const percent = (rate: number) => `${Math.round(rate * 100)}%`;
  return [
    ["概况"],
    ["当前周", formatWeekNo(summary.weekNo, summary.totalWeeks)],
    ["任务总数", summary.total],
    ["已完成", summary.done],
    ["剩余", summary.remaining],
    ["完成率", percent(summary.completionRate)],
    ["按期率", percent(summary.onTimeRate)],
    ["延期率", percent(summary.delayRate)],
    [],
    ["成员", "本周工时", "未完成工时", "每周上限", "负责任务数"],
    ...workload.members.map((m): XlsxCell[] => [
      m.user.realName,
      m.weeklyHours,
      m.loadHours,
      m.capacity,
      m.taskCount,
    ]),
    [],
    ["周起始", "完成任务数"],
    ...weeklyCompleted.map((w): XlsxCell[] => [w.weekStart, w.count]),
    [],
    ["任务", "计划天数", "实际天数", "偏差天数"],
    ...deviations.map((d): XlsxCell[] => [
      d.label,
      d.planDays,
      d.actualDays,
      d.deviationDays,
    ]),
  ];
}
