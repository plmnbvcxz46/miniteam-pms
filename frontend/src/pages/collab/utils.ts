import { collabTodayDate } from "../../data/collab";
import { taskStatusLabel } from "../../data/global";
import type {
  DiscussionBrief,
  DiscussionDetail,
  DiscussionTask,
} from "../../types/collab";
import type { Activity, TaskStatus } from "../../types/global";

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

/**
 * 根据项目动态推导对应的讨论话题 ID
 * - 若 activity.targetType === "DISCUSSION" 且 activity.targetId !== null，直接匹配讨论 ID；
 * - 否则若 activity.targetId !== null，根据讨论关联的任务 ID 匹配；
 * - 兜底：从 activity.detail 中提取 <b>...</b> 文本，与讨论标题或关联任务标题匹配；
 * - 若均未匹配则返回 null。
 */
export function findDiscussionIdByActivity(
  activity: Activity,
  discussions: DiscussionBrief[],
): number | null {
  if (activity.targetType === "DISCUSSION" && activity.targetId !== null) {
    const found = discussions.find((d) => d.id === activity.targetId);
    if (found) return found.id;
  }

  if (activity.targetId !== null) {
    const found = discussions.find((d) => d.task?.id === activity.targetId);
    if (found) return found.id;
  }

  const match = activity.detail.match(/<b>(.*?)<\/b>/);
  if (match && match[1]) {
    const boldText = match[1].trim();
    const found = discussions.find(
      (d) => d.title === boldText || d.task?.title === boldText,
    );
    if (found) return found.id;
  }

  return null;
}

/**
 * 解析日期时间字符串为时间戳毫秒数
 */
function parseTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  if (dateStr === "刚刚" || dateStr.endsWith("刚刚")) {
    return Date.now();
  }
  const iso = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
  const time = new Date(iso).getTime();
  return isNaN(time) ? 0 : time;
}

/**
 * 根据项目动态在讨论详情中查找最相关的评论消息 ID
 * - 优先级 1（精确时间匹配）：查找同一用户且时间完全吻合（或同为“刚刚”）的评论；
 * - 优先级 2（发起讨论动态）：若是 DISCUSSION 的 CREATE 动作，定位到首条评论；
 * - 优先级 3（最接近时间匹配）：同用户发表的评论中，与动态时间差绝对值最小的那条；
 * - 优先级 4（兜底）：返回最后一条评论。
 */
export function findCommentIdByActivity(
  activity: Activity,
  detail?: DiscussionDetail,
): number | null {
  if (!detail || !detail.comments || detail.comments.length === 0) {
    return null;
  }

  const comments = detail.comments;

  // 优先级 1（精确时间匹配）
  if (activity.user) {
    const isActivityJustNow =
      activity.createdAt === "刚刚" || activity.createdAt.endsWith("刚刚");

    if (isActivityJustNow) {
      const justNowComments = comments.filter(
        (c) =>
          c.user.id === activity.user?.id &&
          (c.createdAt === "刚刚" || c.createdAt.endsWith("刚刚")),
      );
      if (justNowComments.length > 0) {
        return justNowComments[justNowComments.length - 1].id;
      }
    } else {
      const exact = comments.find(
        (c) =>
          c.user.id === activity.user?.id && c.createdAt === activity.createdAt,
      );
      if (exact) return exact.id;
    }
  }

  // 优先级 2（若 action === "CREATE" 且 targetType === "DISCUSSION"）
  if (activity.action === "CREATE" && activity.targetType === "DISCUSSION") {
    return comments[0].id;
  }

  // 优先级 3（同用户时间最接近的评论）
  if (activity.user) {
    const userComments = comments.filter(
      (c) => c.user.id === activity.user?.id,
    );
    if (userComments.length > 0) {
      const actTime = parseTimestamp(activity.createdAt);
      let closestComment = userComments[0];
      let minDiff = Math.abs(
        parseTimestamp(closestComment.createdAt) - actTime,
      );

      for (let i = 1; i < userComments.length; i++) {
        const diff = Math.abs(
          parseTimestamp(userComments[i].createdAt) - actTime,
        );
        if (diff < minDiff) {
          minDiff = diff;
          closestComment = userComments[i];
        }
      }
      return closestComment.id;
    }
  }

  // 优先级 4（兜底）
  return comments[comments.length - 1].id;
}
