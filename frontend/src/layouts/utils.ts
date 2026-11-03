import type { ProjectPeriod } from "../types/global";
import { formatDayLabel, toDay } from "../utils/date";

/** 顶栏周进度条需要的数据 */
export interface WeekProgress {
  /** MM.DD */
  startLabel: string;
  /** MM.DD */
  endLabel: string;
  /** 项目总周数 */
  total: number;
  /** 今天在第几周（从 1 起），不在项目周期内为 null */
  current: number | null;
}

/** 按项目起止日期和今天算周进度，周数向上取整 */
export function getWeekProgress(
  period: ProjectPeriod,
  today: string,
): WeekProgress {
  const total = Math.ceil((toDay(period.planEnd) - toDay(period.startDate) + 1) / 7);
  const index = Math.floor((toDay(today) - toDay(period.startDate)) / 7);
  return {
    startLabel: formatDayLabel(period.startDate),
    endLabel: formatDayLabel(period.planEnd),
    total,
    current: index >= 0 && index < total ? index + 1 : null,
  };
}

/** 侧栏摘要卡片需要的项目周期进度 */
export interface PeriodProgress {
  /** 距计划结束还有几天，已过期为 0 */
  daysLeft: number;
  /** 时间进度 0-100，按今天 00:00 占整个周期的比例 */
  percent: number;
}

export function getPeriodProgress(
  period: ProjectPeriod,
  today: string,
): PeriodProgress {
  const start = toDay(period.startDate);
  const end = toDay(period.planEnd) + 1;
  const percent = ((toDay(today) - start) / (end - start)) * 100;
  return {
    daysLeft: Math.max(0, Math.round(toDay(period.planEnd) - toDay(today))),
    percent: Math.round(Math.min(100, Math.max(0, percent))),
  };
}
