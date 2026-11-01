import { collabTodayDate } from "../../data/collab";
import { taskStatusLabel } from "../../data/global";
import type { DiscussionTask } from "../../types/collab";
import type { TaskStatus } from "../../types/global";

/**
 * 两位补零格式化（例如 5 -> "05"，10 -> "10"）
 */
export function formatPadCount(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * 计算指定日期的前一天 (yyyy-MM-dd)
 */
function getPreviousDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const prevY = date.getFullYear();
  const prevM = String(date.getMonth() + 1).padStart(2, "0");
  const prevD = String(date.getDate()).padStart(2, "0");
  return `${prevY}-${prevM}-${prevD}`;
}

/**
 * 用于左侧讨论列表项底部时间
 * - 若为 "刚刚" 返回 "刚刚"；
 * - 若日期部分等于 todayDate（如 "2026-10-22"）则返回 HH:mm（如 "10:41"）；
 * - 若是前一天（"2026-10-21"）返回 "昨天"；
 * - 其余返回 MM.DD（如 "10.20"、"10.17"）。
 */
export function formatThreadShortTime(
  dateTimeStr: string | null,
  todayDate: string = collabTodayDate,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";

  const prevDate = getPreviousDate(todayDate);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");

  const [datePart, timePart = ""] = dateTimeStr.split(" ");

  if (datePart === todayDate || datePart === todayMMDD) {
    return timePart.slice(0, 5) || datePart;
  }
  if (datePart === prevDate || datePart === prevMMDD) {
    return "昨天";
  }

  // 其余返回 MM.DD
  const [m, d] = datePart.split("-").slice(-2);
  if (m && d) {
    return `${m}.${d}`;
  }
  return datePart.replace("-", ".");
}

/**
 * 用于讨论消息与右侧项目动态的时间展示
 * - 若为 "刚刚" 返回 "刚刚"；
 * - 若日期部分等于 todayDate 返回 HH:mm（如 "10:52"）；
 * - 若是前一天返回 "昨天 HH:mm"（如 "昨天 16:20"）；
 * - 其余返回 MM.DD HH:mm（如 "10.20 16:10"）。
 */
export function formatMessageTime(
  dateTimeStr: string,
  todayDate: string = collabTodayDate,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";

  if (!dateTimeStr.includes(" ")) {
    return dateTimeStr;
  }

  const prevDate = getPreviousDate(todayDate);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");

  const [datePart, timePart = ""] = dateTimeStr.split(" ");
  const hm = timePart.slice(0, 5);

  if (datePart === todayDate || datePart === todayMMDD) {
    return hm;
  }
  if (datePart === prevDate || datePart === prevMMDD) {
    return `昨天 ${hm}`.trim();
  }

  const [m, d] = datePart.split("-").slice(-2);
  if (m && d) {
    return `${m}.${d} ${hm}`.trim();
  }
  return `${datePart.replace("-", ".")} ${hm}`.trim();
}

/**
 * 获取任务状态对应的 key 样式类
 * BLOCKED -> "stuck", DOING -> "on", DONE -> "done", TODO -> ""
 */
export function getTaskKeyClass(status: TaskStatus): string {
  switch (status) {
    case "BLOCKED":
      return "stuck";
    case "DOING":
      return "on";
    case "DONE":
      return "done";
    case "TODO":
    default:
      return "";
  }
}

/**
 * 获取任务状态提示文本
 * 当 task.overdueDays > 0 时返回 `逾期 ${task.overdueDays} 天`，否则返回 taskStatusLabel[task.status]
 */
export function getTaskStatusNote(task: DiscussionTask): string {
  if (task.overdueDays > 0) {
    return `逾期 ${task.overdueDays} 天`;
  }
  return taskStatusLabel[task.status] ?? "";
}

/**
 * 格式化协作页顶部 kicker
 * `${discussionCount} 个讨论 · 今天 ${todayActivityCount} 条动态` + (overdueCount > 0 ? ` · ${overdueCount} 个关联逾期` : "")
 */
export function formatCollabKicker(
  discussionCount: number,
  todayActivityCount: number,
  overdueCount: number,
): string {
  const overduePart = overdueCount > 0 ? ` · ${overdueCount} 个关联逾期` : "";
  return `${discussionCount} 个讨论 · 今天 ${todayActivityCount} 条动态${overduePart}`;
}

export interface RichInlineSegment {
  type: "text" | "em" | "b";
  content: string;
}

/**
 * 将字符串中的 <em>...</em> 或 <b>...</b> 解析为片段数组，
 * 供组件安全渲染为 <em> / <b> React 节点（避免使用 dangerouslySetInnerHTML）
 */
export function parseRichInline(text: string): RichInlineSegment[] {
  if (!text) return [];
  const regex = /<(em|b)>(.*?)<\/\1>/g;
  const result: RichInlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    result.push({
      type: match[1] as "em" | "b",
      content: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return result;
}
