import { formatDayLabel } from "../../shared/utils/date";

/** 通知时间：今天显示 HH:mm，其余只显示 MM.DD（完整时间放在悬停提示里） */
export function formatNotificationTime(
  createdAt: string,
  today: string,
): string {
  const [date, time = ""] = createdAt.split(" ");
  const hm = time.slice(0, 5);
  return date === today ? hm : formatDayLabel(date);
}
