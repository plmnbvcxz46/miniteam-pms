import type { ProjectPeriod, UserBrief } from "../../types/global";
import type { DependencyTask, TaskDetail } from "../../types/task";
import {
  addDays,
  dayEnd,
  formatDayLabel,
  pad2,
  toDay,
  weekdayOf,
} from "../../utils/date";
import type { CpmResult, TimelineForecast } from "../timeline/utils";

/** 一周的天数 */
export const WEEK_DAYS = 7;

/** date 所在周的周一 */
function weekStartOf(date: string): string {
  return addDays(date, -((weekdayOf(date) + 6) % 7));
}

/** 此刻是当天的几分之几（0 点为 0，正午为 0.5），按 Asia/Shanghai，只取本地时钟的时分 */
export function getDayProgress(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}

/** 未完成 */
function isOpen(task: TaskDetail): boolean {
  return task.status !== "DONE";
}

/** 页头小标题：第 05/10 周 · 已完成 3 项 · 待推进 8 项 · 逾期 1 项（期号和日期顶栏已有，不重复） */
export function formatKicker(
  stats: OverviewStats,
  today: string,
  period: ProjectPeriod,
): string {
  const week = Math.floor((toDay(today) - toDay(period.startDate)) / 7) + 1;
  const weeks = Math.ceil(
    (dayEnd(period.planEnd) - toDay(period.startDate)) / 7,
  );
  return `第 ${pad2(week)}/${pad2(weeks)} 周 · 已完成 ${stats.done} 项 · 待推进 ${stats.left} 项 · 逾期 ${stats.overdue.length} 项`;
}

/* ---------- 四个数字 ---------- */

export interface OverviewStats {
  total: number;
  done: number;
  left: number;
  /** 未完成的任务里在关键路径上的数量 */
  criticalLeft: number;
  /** 未完成且已逾期的任务，逾期最久的在前 */
  overdue: TaskDetail[];
  /** 离项目计划结束还剩几天 */
  daysLeft: number;
}

export function getOverviewStats(
  all: TaskDetail[],
  cpm: CpmResult,
  today: string,
  period: ProjectPeriod,
): OverviewStats {
  const open = all.filter(isOpen);
  return {
    total: all.length,
    done: all.length - open.length,
    left: open.length,
    criticalLeft: open.filter((task) => cpm.rows[task.id]?.slack === 0).length,
    overdue: open
      .filter((task) => task.overdueDays > 0)
      .sort((a, b) => b.overdueDays - a.overdueDays),
    daysLeft: Math.max(0, Math.round(toDay(period.planEnd) - toDay(today))),
  };
}

/* ---------- 今日头条 ---------- */

export interface Headline {
  /** 最该关注的逾期任务，没有逾期为空 */
  task: TaskDetail | null;
  /** 因它受阻的后续任务（还没完成的） */
  blocked: DependencyTask[];
}

/** 逾期任务里先看在关键路径上的，再看逾期最久的 */
export function getHeadline(overdue: TaskDetail[], cpm: CpmResult): Headline {
  const task =
    [...overdue].sort(
      (a, b) =>
        Number(cpm.rows[b.id]?.slack === 0) -
          Number(cpm.rows[a.id]?.slack === 0) || b.overdueDays - a.overdueDays,
    )[0] ?? null;
  return {
    task,
    blocked: task?.successors.filter((dep) => dep.status !== "DONE") ?? [],
  };
}

/* ---------- 今日待办 ---------- */

export interface TodoItemData {
  task: TaskDetail;
  /** 标签文字 */
  tag: string;
  /** late 已逾期 / now 今天截止 */
  tone: "late" | "now";
}

/** 今日待办：已逾期的和今天截止的任务 */
export function getTodos(all: TaskDetail[], today: string): TodoItemData[] {
  return all
    .filter(isOpen)
    .flatMap((task): TodoItemData[] => {
      if (task.overdueDays > 0) {
        return [{ task, tag: `逾期 ${task.overdueDays} 天`, tone: "late" }];
      }
      if (task.dueDate === today) {
        return [{ task, tag: "今天截止", tone: "now" }];
      }
      return [];
    })
    .sort(
      (a, b) =>
        b.task.overdueDays - a.task.overdueDays ||
        a.task.taskNo - b.task.taskNo,
    );
}

/* ---------- 关键路径 ---------- */

/** 关键路径上的任务（总时差为 0），按最早开始排 */
export function getCriticalChain(
  tasks: TaskDetail[],
  cpm: CpmResult,
): TaskDetail[] {
  return tasks
    .filter((task) => cpm.rows[task.id]?.slack === 0)
    .sort((a, b) => cpm.rows[a.id].es - cpm.rows[b.id].es);
}

/** 预测比计划晚了没有 */
export function isLate(forecast: TimelineForecast): boolean {
  return forecast.delayDays > 0;
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

export interface ScheduleBar {
  task: TaskDetail;
  /** 占一周的百分比 */
  left: number;
  width: number;
  /** 同一个人同时有几件事时往下叠，从 0 开始 */
  lane: number;
  tone: "on" | "next" | "stuck";
}

export interface ScheduleRowData {
  user: UserBrief;
  bars: ScheduleBar[];
  lanes: number;
}

const TONE: Record<string, ScheduleBar["tone"]> = {
  DOING: "on",
  BLOCKED: "stuck",
};

/**
 * 每个成员这一周要做的事：未完成、和本周有交集的任务。
 * 逾期的任务条画到今天（逾期的部分还在占人）；同一个人的任务重叠时往下叠一行
 */
export function getSchedule(
  all: TaskDetail[],
  members: UserBrief[],
  week: WeekDay[],
  today: string,
): ScheduleRowData[] {
  const weekStart = toDay(week[0].date);
  const weekEnd = weekStart + WEEK_DAYS;

  return members.map((user) => {
    const spans = all
      .filter(
        (task) =>
          isOpen(task) &&
          task.assignee?.id === user.id &&
          task.planStart &&
          task.dueDate,
      )
      .map((task) => {
        const last = task.overdueDays > 0 ? today : task.dueDate!;
        return {
          task,
          start: Math.max(toDay(task.planStart!), weekStart),
          end: Math.min(Math.max(dayEnd(last), dayEnd(task.dueDate!)), weekEnd),
        };
      })
      .filter((span) => span.end > span.start)
      .sort((a, b) => a.start - b.start);

    const laneEnds: number[] = [];
    const bars = spans.map(({ task, start, end }): ScheduleBar => {
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = end;
      return {
        task,
        left: ((start - weekStart) / WEEK_DAYS) * 100,
        width: ((end - start) / WEEK_DAYS) * 100,
        lane,
        tone: TONE[task.status] ?? "next",
      };
    });
    return { user, bars, lanes: Math.max(1, laneEnds.length) };
  });
}

/** 计划 → 预测 的日期文字，没晚就只写计划 */
export function formatForecastRange(forecast: TimelineForecast): string {
  const plan = formatDayLabel(forecast.planEnd);
  return isLate(forecast)
    ? `${plan} → ${formatDayLabel(forecast.predictedEnd)}`
    : `${plan} 按时`;
}
