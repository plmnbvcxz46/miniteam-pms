import type { Member } from "../../types/members";
import { pad2 } from "../../utils/date";

/**
 * 格式化 Date 为 yyyy-MM-dd HH:mm:ss 字符串
 */
export function formatFullDateTime(d: Date): string {
  const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return `${date} ${time}`;
}

/**
 * 每周工时上限的显示文字：所有人一样显示“上限 40”，不一样显示“上限 32–40”
 */
export function formatCapacity(members: Member[]): string {
  if (members.length === 0) return "";
  const caps = members.map((m) => m.weeklyCapacity);
  const min = Math.min(...caps);
  const max = Math.max(...caps);
  return min === max ? `上限 ${min}` : `上限 ${min}–${max}`;
}

/**
 * 计算超出工时上限的成员人数
 */
export function getOverCapacityCount(members: Member[]): number {
  return members.filter(
    (m) => m.overCapacity || m.weeklyHours > m.weeklyCapacity,
  ).length;
}

