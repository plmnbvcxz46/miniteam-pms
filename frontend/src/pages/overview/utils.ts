import type { ProjectPeriod, TaskStatus, UserBrief } from "../../types/global";
import type {
  OverviewStats,
  ScheduleRow,
  TodoItem,
} from "../../types/progress";
import type { TaskDetail } from "../../types/task";
import {
  addDays,
  formatDayLabel,
  formatWeekNo,
  getTotalWeeks,
  getWeekIndex,
  toDay,
  weekStartOf,
} from "../../utils/date";
import { taskStatusKey } from "../../data/task";
import type { TimelineForecast } from "../timeline/utils";

/** 一周的天数 */
export const WEEK_DAYS = 7;

/** 此刻是当天的几分之几（0 点为 0，正午为 0.5），按 Asia/Shanghai，只取本地时钟的时分 */
export function getDayProgress(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}

/** 页头小标题：第 05/10 周 · 已完成 3 项 · 待推进 8 项 · 逾期 1 项（期号和日期顶栏已有，不重复） */
export function formatKicker(
  stats: OverviewStats,
  today: string,
  period: ProjectPeriod,
): string {
  const week = getWeekIndex(period.startDate, today);
  const weeks = getTotalWeeks(period.startDate, period.planEnd);
  return `第 ${formatWeekNo(week, weeks)} 周 · 已完成 ${stats.done} 项 · 待推进 ${stats.remaining} 项 · 逾期 ${stats.overdue} 项`;
}

/** 逾期最久的未完成任务（四个数字里“逾期”下面那行字用），没有为空 */
export function getWorstOverdue(tasks: TaskDetail[]): TaskDetail | null {
  return (
    tasks
      .filter((task) => task.status !== "DONE" && task.overdueDays > 0)
      .sort((a, b) => b.overdueDays - a.overdueDays || a.taskNo - b.taskNo)[0] ??
    null
  );
}

/* ---------- 今日待办 ---------- */

export interface TodoRow {
  id: number;
  title: string;
  /** 任务现在的状态，决定前面小方块的颜色；任务表里还没有这个任务时为空 */
  status: TaskStatus | null;
  /** 标签文字 */
  tag: string;
  /** late 已逾期 / now 今天截止 */
  tone: "late" | "now" | "";
}

/** 接口的待办（按得分排好）换成面板的行；状态从任务表里按 id 找 */
export function toTodoRows(
  items: TodoItem[],
  taskMap: Record<number, TaskDetail>,
): TodoRow[] {
  return items.map((item) => ({
    id: item.task.id,
    title: item.task.title,
    status: taskMap[item.task.id]?.status ?? null,
    tag: item.overdueDays > 0 ? `逾期 ${item.overdueDays} 天` : item.dueTag,
    tone: item.overdueDays > 0 ? "late" : item.dueTag === "今天" ? "now" : "",
  }));
}

/* ---------- 本周成员排期 ---------- */

export interface WeekDay {
  date: string;
  /** 几号 */
  label: string;
  weekend: boolean;
  today: boolean;
}

/** 今天所在的这一周（周一到周日） */
export function getWeek(today: string): WeekDay[] {
  const start = weekStartOf(today);
  return Array.from({ length: WEEK_DAYS }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      label: date.slice(8),
      weekend: i >= 5,
      today: date === today,
    };
  });
}

export interface ScheduleBarView {
  taskId: number;
  title: string;
  /** 占一周的百分比 */
  left: number;
  width: number;
  /** 同一个人同时有几件事时往下叠，从 0 开始 */
  lane: number;
  tone: "on" | "next" | "stuck";
}

export interface ScheduleRowData {
  user: UserBrief;
  bars: ScheduleBarView[];
  lanes: number;
}

/**
 * 接口给的是每个成员本周的任务条（起止日期都含），这里换算成一周里的位置，
 * 同一个人的任务重叠时往下叠一行
 */
export function toScheduleRows(
  rows: ScheduleRow[],
  week: WeekDay[],
): ScheduleRowData[] {
  const weekStart = toDay(week[0].date);

  return rows.map((row) => {
    const spans = row.bars
      .map((bar) => ({
        bar,
        start: toDay(bar.start),
        end: toDay(bar.end) + 1,
      }))
      .sort((a, b) => a.start - b.start);

    const laneEnds: number[] = [];
    const bars = spans.map(({ bar, start, end }): ScheduleBarView => {
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = end;
      const key = taskStatusKey[bar.status];
      return {
        taskId: bar.taskId,
        title: bar.title,
        left: ((start - weekStart) / WEEK_DAYS) * 100,
        width: ((end - start) / WEEK_DAYS) * 100,
        lane,
        // 色块沿用任务状态的 .key 颜色：进行中 on、阻塞 stuck，其余是 next
        tone: key === "on" || key === "stuck" ? key : "next",
      };
    });
    return { user: row.user, bars, lanes: Math.max(1, laneEnds.length) };
  });
}

/* ---------- 预测 ---------- */

/** 预测比计划晚了没有 */
export function isLate(forecast: { delayDays: number }): boolean {
  return forecast.delayDays > 0;
}

/** 计划 → 预测 的日期文字，没晚就只写计划 */
export function formatForecastRange(forecast: TimelineForecast): string {
  const plan = formatDayLabel(forecast.planEnd);
  return isLate(forecast)
    ? `${plan} → ${formatDayLabel(forecast.predictedEnd)}`
    : `${plan} 按时`;
}
