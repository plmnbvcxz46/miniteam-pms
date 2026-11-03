import type { Member } from "../../types/members";

/**
 * 将活动创建时间（yyyy-MM-dd HH:mm:ss）截取为变更记录展示格式（M.DD，如 "10.21"、"9.22"）
 */
export function formatLogDate(dateStr: string): string {
  if (!dateStr) return "";
  const match = dateStr.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = match[2];
    return `${month}.${day}`;
  }
  // 若传入格式已是 M.DD 或 MM.DD 则直接返回
  return dateStr;
}

/**
 * 格式化 Date 为 yyyy-MM-dd HH:mm:ss 字符串
 */
export function formatFullDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 计算超出工时上限的成员人数
 */
export function getOverCapacityCount(members: Member[]): number {
  return members.filter(
    (m) => m.overCapacity || m.weeklyHours > m.weeklyCapacity,
  ).length;
}

