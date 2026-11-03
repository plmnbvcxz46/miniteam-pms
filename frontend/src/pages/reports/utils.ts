/**
 * 统计报表模块纯函数：接口字段 → 展示文案与图表比例换算
 */
import type {
  DurationDeviation,
  ReportSummary,
  WeeklyCompleted,
  Workload,
} from "../../types/reports";
import { toCsvRow } from "../../utils/download";

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
  if (delayDays < 0) return `早 ${Math.abs(delayDays)} 天`;
  return "按计划";
}

/**
 * 把报表页上的数据拼成 CSV（Excel 可以直接打开）。
 * 接口接通后由 GET /projects/{projectId}/reports/export 返回 Excel 文件，这里只是替身
 */
export function buildReportCsv(data: {
  summary: ReportSummary;
  workload: Workload;
  weeklyCompleted: WeeklyCompleted[];
  deviations: DurationDeviation[];
}): string {
  const { summary, workload, weeklyCompleted, deviations } = data;
  const percent = (rate: number) => `${Math.round(rate * 100)}%`;
  return [
    toCsvRow(["概况", ""]),
    toCsvRow(["当前周", formatWeekNo(summary.weekNo, summary.totalWeeks)]),
    toCsvRow(["任务总数", summary.total]),
    toCsvRow(["已完成", summary.done]),
    toCsvRow(["剩余", summary.remaining]),
    toCsvRow(["完成率", percent(summary.completionRate)]),
    toCsvRow(["按期率", percent(summary.onTimeRate)]),
    toCsvRow(["延期率", percent(summary.delayRate)]),
    "",
    toCsvRow(["成员", "本周工时", "未完成工时", "每周上限", "负责任务数"]),
    ...workload.members.map((m) =>
      toCsvRow([m.user.realName, m.weeklyHours, m.loadHours, m.capacity, m.taskCount]),
    ),
    "",
    toCsvRow(["周起始", "完成任务数"]),
    ...weeklyCompleted.map((w) => toCsvRow([w.weekStart, w.count])),
    "",
    toCsvRow(["任务", "计划天数", "实际天数", "偏差天数"]),
    ...deviations.map((d) =>
      toCsvRow([d.label, d.planDays, d.actualDays, d.deviationDays]),
    ),
  ].join("\r\n");
}
