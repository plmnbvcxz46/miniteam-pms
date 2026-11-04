import type { CriticalPath } from "../../types/progress";
import type { TaskDetail } from "../../types/task";
import {
  dayEnd,
  toDateString,
  toDay,
  weekStartTime,
  type AxisRange,
} from "../../utils/date";

/** 关键路径法（CPM）的一行，单位都是工作日，从项目第 0 天算起。由后端算，见 GET /critical-path */
export interface CpmRow {
  /** 最早开始 / 最早完成 */
  es: number;
  ef: number;
  /** 最迟开始 / 最迟完成 */
  ls: number;
  lf: number;
  /** 总时差：晚开始多少天也不影响总工期，0 即在关键路径上 */
  slack: number;
}

export interface CpmResult {
  rows: Record<number, CpmRow>;
  /** 总工期（工作日） */
  total: number;
}

/** 时间线的预测：计划完成日、预测完成日，以及晚了几个工作日 */
export interface TimelineForecast {
  planEnd: string;
  predictedEnd: string;
  delayDays: number;
}


/** 接口的关键路径结果（GET /critical-path）换成时间线页用的形状：总时差 totalFloat 即 slack */
export function toCpm(path: CriticalPath): CpmResult {
  return {
    rows: Object.fromEntries(
      path.rows.map((row) => [
        row.taskId,
        { es: row.es, ef: row.ef, ls: row.ls, lf: row.lf, slack: row.totalFloat },
      ]),
    ),
    total: path.totalDuration,
  };
}

/** 接口的预测（甘特图、关键路径、总览里都带）换成时间线页用的形状 */
export function toForecast(f: {
  plannedEnd: string;
  predictedEnd: string;
  delayDays: number;
}): TimelineForecast {
  return {
    planEnd: f.plannedEnd,
    predictedEnd: f.predictedEnd,
    delayDays: f.delayDays,
  };
}

/** 画在时间线上的任务：有排期的，按开始日排，同一天按编号 */
export function getTimelineTasks(
  taskMap: Record<number, TaskDetail>,
): TaskDetail[] {
  return Object.values(taskMap)
    .filter((task) => task.planStart && task.dueDate)
    .sort(
      (a, b) =>
        toDay(a.planStart!) - toDay(b.planStart!) || a.taskNo - b.taskNo,
    );
}

/**
 * 时间线的横轴范围：从最早的开始日（或今天）所在周的周一，
 * 到最晚的截止 / 预测 / 今天所在周的周日 24:00，整周整周地铺满
 */
export function getTimelineRange(
  tasks: TaskDetail[],
  forecast: TimelineForecast,
  today: string,
): AxisRange {
  const starts = [today, ...tasks.map((task) => task.planStart!)];
  const ends = [
    today,
    forecast.predictedEnd,
    ...tasks.map((task) => task.dueDate!),
  ].filter(Boolean);
  const first = Math.min(...starts.map(toDay));
  const last = Math.max(...ends.map(dayEnd)) - 1;
  return { start: weekStartTime(first), end: weekStartTime(last) + 7 };
}

/** 范围内每周的周一（yyyy-MM-dd） */
export function getWeekStarts(range: AxisRange): string[] {
  const weeks = Math.round((range.end - range.start) / 7);
  return Array.from({ length: weeks }, (_, i) =>
    toDateString(range.start + i * 7),
  );
}
