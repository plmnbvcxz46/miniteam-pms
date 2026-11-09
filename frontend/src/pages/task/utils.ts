import type { DocumentBrief } from "../../shared/types/task";
import { daysBetween, formatMonthDay } from "../../shared/utils/date";

/** 操作记录时间：今天只显示时分，昨天显示“昨天”，更早显示月日 */
export function formatLogTime(createdAt: string, today: string): string {
  const [date, time = ""] = createdAt.split(" ");
  const clock = time.slice(0, 5);
  const daysAgo = daysBetween(date, today);
  if (daysAgo === 0) return clock;
  if (daysAgo === 1) return `昨天 ${clock}`;
  return `${formatMonthDay(date)} ${clock}`;
}

/** 文档状态文案 */
export function formatDocStatus(doc: DocumentBrief): string {
  if (doc.overdueDays > 0) return `逾期 ${doc.overdueDays} 天`;
  return doc.status === "FINAL" ? "定稿" : "修订中";
}
