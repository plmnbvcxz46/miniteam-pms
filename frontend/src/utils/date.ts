import { projectTodayDate } from "../constants/mock";

export const DAY_MS = 24 * 60 * 60 * 1000;

/** 数字补成两位，例如 5 -> "05" */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * 时间点：从 1970-01-01 起的天数，可带小数（0.5 = 当天 12:00）。
 * 约定日期 d 占据 [d 00:00, d+1 00:00)，所以 toDay(d) 是 d 的 00:00，dayEnd(d) 是 d 的 24:00。
 * 全部按项目所在地（Asia/Shanghai）的本地时间算，不做时区换算
 */
export type DayTime = number;

/** 时间轴范围，start / end 都是时间点 */
export interface AxisRange {
  start: DayTime;
  end: DayTime;
}

/** 时间轴上的一个刻度 */
export interface AxisTick {
  /** yyyy-MM-dd */
  date: string;
  /** MM.DD */
  label: string;
}

/** 计算时间轴范围需要的任务字段 */
interface AxisTask {
  planStart: string | null;
  dueDate: string | null;
  actualEnd: string | null;
  status: string;
}

/** 项目日期，即顶栏“第 N 期 YYYY 年 MM 月 DD 日”显示的日期，不用系统时间。yyyy-MM-dd */
export function getProjectToday(): string {
  return projectTodayDate;
}

/** 本机此刻在项目所在地（Asia/Shanghai）是哪一天，yyyy-MM-dd；新建项目的默认开始日期等用它 */
export function getLocalToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
}

/** yyyy-MM-dd 的 00:00 */
export function toDay(date: string): DayTime {
  return Date.parse(date) / DAY_MS;
}

/** yyyy-MM-dd 的 24:00（次日 00:00） */
export function dayEnd(date: string): DayTime {
  return toDay(date) + 1;
}

/** 时间点转回 yyyy-MM-dd */
export function toDateString(time: DayTime): string {
  return new Date(Math.floor(time) * DAY_MS).toISOString().slice(0, 10);
}

/** yyyy-MM-dd 加减若干天 */
export function addDays(date: string, days: number): string {
  return toDateString(toDay(date) + days);
}

/** 时间点所在周的周一 00:00 */
export function weekStartTime(time: DayTime): DayTime {
  const day = Math.floor(time);
  const weekday = new Date(day * DAY_MS).getUTCDay();
  return day - ((weekday + 6) % 7);
}

/** yyyy-MM-dd 所在周的周一 */
export function weekStartOf(date: string): string {
  return toDateString(weekStartTime(toDay(date)));
}

/** 项目总周数：起止日期（含）跨几周，向上取整 */
export function getTotalWeeks(startDate: string, planEnd: string): number {
  return Math.ceil((dayEnd(planEnd) - toDay(startDate)) / 7);
}

/** 今天是项目的第几周（从 1 起），不限制在项目周期内 */
export function getWeekIndex(startDate: string, today: string): number {
  return Math.floor((toDay(today) - toDay(startDate)) / 7) + 1;
}

/** 周次文案，两位补零，例如 5, 10 -> "05/10" */
export function formatWeekNo(week: number, totalWeeks: number): string {
  return `${pad2(week)}/${pad2(totalWeeks)}`;
}

/** 两个 yyyy-MM-dd 之间相差的天数 */
export function daysBetween(from: string, to: string): number {
  return Math.round(toDay(to) - toDay(from));
}

/** 星期几，周日为 0 */
export function weekdayOf(date: string): number {
  return new Date(toDay(date) * DAY_MS).getUTCDay();
}

/** 当天是不是周末 */
export function isWeekend(date: string): boolean {
  const day = weekdayOf(date);
  return day === 0 || day === 6;
}

/** yyyy-MM-dd 转成 MM.DD，例如 "2026-10-20" -> "10.20" */
export function formatDayLabel(date: string): string {
  return date.slice(5).replace("-", ".");
}

/**
 * yyyy-MM-dd（后面可以跟时间）转成月份不补零的 M.DD，例如 "2026-09-20" -> "9.20"。
 * 不是这个格式的原样返回
 */
export function formatMonthDay(date: string): string {
  const match = date.match(/^\d{4}-(\d{2})-(\d{2})/);
  return match ? `${Number(match[1])}.${match[2]}` : date;
}

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

/** yyyy-MM-dd 转成 "2026 年 10 月 22 日 周四" */
export function formatFullDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(toDay(date) * DAY_MS).getUTCDay();
  return `${year} 年 ${month} 月 ${day} 日 周${WEEKDAY_LABELS[weekday]}`;
}

/**
 * 解析 yyyy-MM-dd HH:mm:ss 为时间点。
 * 前端自己追加的记录时间是 “yyyy-MM-dd 刚刚”，没有具体时刻，按当天中午算
 */
export function parseDateTime(value: string): DayTime {
  const [date, time = ""] = value.split(" ");
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
  if (!match) return toDay(date) + 0.5;
  const [, hour, minute, second = "0"] = match;
  return (
    toDay(date) +
    (Number(hour) * 3600 + Number(minute) * 60 + Number(second)) / 86400
  );
}

/**
 * 时间轴范围：[min(开始日, 今天) − pad 天, 最后一个要画的时间点 + pad 天]。
 * 最后一个时间点取截止日 24:00、完成日 24:00、今天 00:00 中最晚的，
 * 这样今天线、完成标记、截止线一定落在范围内，不用裁切。pad 默认 2 天，概览小条传 0
 */
export function getAxisRange(
  task: AxisTask,
  today: string,
  pad = 2,
): AxisRange {
  const first = Math.min(toDay(task.planStart ?? today), toDay(today));
  const last = Math.max(
    task.dueDate ? dayEnd(task.dueDate) : toDay(today),
    task.status === "DONE" && task.actualEnd
      ? dayEnd(task.actualEnd)
      : -Infinity,
    toDay(today),
  );
  return { start: first - pad, end: last + pad };
}

/** 范围内的每一天（yyyy-MM-dd），用来画每日小刻度 */
export function getAxisDays(range: AxisRange): string[] {
  const days = Math.round(range.end - range.start);
  return Array.from({ length: days }, (_, i) => toDateString(range.start + i));
}

/** 在范围内均匀取 count 个日期作刻度标签，头尾两天一定在内 */
export function getAxisTicks(range: AxisRange, count = 4): AxisTick[] {
  const days = getAxisDays(range);
  const total = Math.min(count, days.length);
  const dates = Array.from({ length: total }, (_, i) =>
    total === 1
      ? days[0]
      : days[Math.round((i * (days.length - 1)) / (total - 1))],
  );
  return dates.map((date) => ({ date, label: formatDayLabel(date) }));
}

/**
 * 日期 / 时间点换算成横坐标，是时间轴上唯一的换算函数。
 * 传 yyyy-MM-dd 按这一天的 00:00 算；要 24:00 或具体时刻就传 DayTime。
 * width 传 100 得到百分比
 */
export function dateToX(
  date: string | DayTime,
  range: AxisRange,
  width: number,
): number {
  const time = typeof date === "string" ? toDay(date) : date;
  return ((time - range.start) / (range.end - range.start)) * width;
}
