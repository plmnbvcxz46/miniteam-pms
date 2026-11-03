import { weekdayOf } from "../../utils/date";
import type { LogItem } from "../../types/settings";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

/** yyyy-MM-dd HH:mm:ss 里的日期转成 “10 月 22 日 周四” */
export function formatLogDay(createdAt: string): string {
  const date = createdAt.slice(0, 10);
  const [, month, day] = date.split("-").map(Number);
  return `${month} 月 ${day} 日 周${WEEKDAY_LABELS[weekdayOf(date)]}`;
}

/** 日志按天分组，保持传入顺序（时间倒序） */
export function groupLogsByDay(
  logs: LogItem[],
): { day: string; items: LogItem[] }[] {
  const groups: { day: string; items: LogItem[] }[] = [];
  for (const log of logs) {
    const day = formatLogDay(log.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(log);
    else groups.push({ day, items: [log] });
  }
  return groups;
}
