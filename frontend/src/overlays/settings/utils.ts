import { toDay } from "../../utils/date";
import type { LogItem, Permission } from "../../types/settings";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

/** yyyy-MM-dd HH:mm:ss 里的日期转成 “10 月 22 日 周四” */
export function formatLogDay(createdAt: string): string {
  const date = createdAt.slice(0, 10);
  const [, month, day] = date.split("-").map(Number);
  const weekday = new Date(toDay(date) * 86400000).getUTCDay();
  return `${month} 月 ${day} 日 周${WEEKDAY_LABELS[weekday]}`;
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

/** 权限按钮在矩阵里的层级：view / list 是菜单（一级），其余是菜单里的按钮（二级） */
export function getPermLevel(permission: Permission): 1 | 2 {
  return /:(view|list)$/.test(permission.code) ? 1 : 2;
}

/** 权限按分组整理，组内保持接口顺序 */
export function groupPermissions(
  permissions: Permission[],
): { group: string; items: Permission[] }[] {
  const groups: { group: string; items: Permission[] }[] = [];
  for (const permission of permissions) {
    const found = groups.find((g) => g.group === permission.group);
    if (found) found.items.push(permission);
    else groups.push({ group: permission.group, items: [permission] });
  }
  return groups;
}
