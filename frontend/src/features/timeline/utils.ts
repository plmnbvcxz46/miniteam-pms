import type { CriticalPath } from "../../shared/types/progress";
import type { TaskDetail } from "../../shared/types/task";
import {
  dateToX,
  dayEnd,
  formatDayLabel,
  toDateString,
  toDay,
  weekStartTime,
  type AxisRange,
} from "../../shared/utils/date";
import type { TimelineForecast } from "../../shared/utils/forecast";

export { toForecast, type TimelineForecast } from "../../shared/utils/forecast";

/** 关键路径法（CPM）的一行，单位都是工作日，从项目第 0 天算起 */
export interface CpmRow {
  es: number;
  ef: number;
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

export interface GanttFlag {
  key: string;
  text: string;
  late: boolean;
  left: number;
  width: number;
}

/** 接口的关键路径结果（GET /critical-path）换成时间线页用的形状 */
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

/** 时间线的横轴范围：整周铺满 */
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

function estimateFlagWidth(text: string): number {
  return (
    [...text].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 10 : 6), 0) + 4
  );
}

/** 计算甘特图顶端“今天 / 计划 / 预测”竖线标签位置并自动防重叠 */
export function computeGanttFlags({
  range,
  width,
  nameWidth,
  today,
  forecast,
}: {
  range: AxisRange;
  width: number;
  nameWidth: number;
  today: string;
  forecast: TimelineForecast;
}): GanttFlag[] {
  const x = (time: number) => nameWidth + dateToX(time, range, width);
  const late = forecast.delayDays > 0;
  const totalWidth = nameWidth + width;
  const defs = [
    { key: "today", at: x(dayEnd(today)), text: "今天", late: false },
    {
      key: "plan",
      at: x(dayEnd(forecast.planEnd)),
      text: `计划 ${formatDayLabel(forecast.planEnd)}`,
      late: false,
    },
    ...(late
      ? [
          {
            key: "pred",
            at: x(dayEnd(forecast.predictedEnd)),
            text: `预测 ${formatDayLabel(forecast.predictedEnd)}`,
            late: true,
          },
        ]
      : []),
  ].sort((a, b) => a.at - b.at);

  const taken: [number, number][] = [];
  return defs.map((def) => {
    const flagWidth = estimateFlagWidth(def.text);
    const clashes = (l: number, r: number) =>
      taken.some(([tl, tr]) => l < tr && r > tl);
    let left = def.at + 3;
    if (left + flagWidth > totalWidth || clashes(left, left + flagWidth)) {
      left = def.at - 3 - flagWidth;
    }
    taken.push([left, left + flagWidth]);
    return { key: def.key, text: def.text, late: def.late, left, width: flagWidth };
  });
}
