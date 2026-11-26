import { taskStatusLabel } from "../../../shared/constants/task";
import type { DiscussionTask, MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import { addDays } from "../../../shared/utils/date";

/** 用于左侧讨论列表项底部时间 */
export function formatThreadShortTime(
  dateTimeStr: string | null,
  todayDate: string,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";

  const prevDate = addDays(todayDate, -1);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");
  const [datePart, timePart = ""] = dateTimeStr.split(" ");

  if (datePart === todayDate || datePart === todayMMDD) {
    return timePart.slice(0, 5) || datePart;
  }
  if (datePart === prevDate || datePart === prevMMDD) return "昨天";

  const [m, d] = datePart.split("-").slice(-2);
  return m && d ? `${m}.${d}` : datePart.replace("-", ".");
}

/** 用于讨论消息与右侧项目动态的时间展示 */
export function formatMessageTime(
  dateTimeStr: string,
  todayDate: string,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";
  if (!dateTimeStr.includes(" ")) return dateTimeStr;

  const prevDate = addDays(todayDate, -1);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");
  const [datePart, timePart = ""] = dateTimeStr.split(" ");
  const hm = timePart.slice(0, 5);

  if (datePart === todayDate || datePart === todayMMDD) return hm;
  if (datePart === prevDate || datePart === prevMMDD) return `昨天 ${hm}`.trim();

  const [m, d] = datePart.split("-").slice(-2);
  return m && d
    ? `${m}.${d} ${hm}`.trim()
    : `${datePart.replace("-", ".")} ${hm}`.trim();
}

export function getTaskStatusNote(task: DiscussionTask): string {
  if (task.overdueDays > 0) return `逾期 ${task.overdueDays} 天`;
  return taskStatusLabel[task.status] ?? "";
}

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

/** 将字符串中的 <em> / <b> 解析为安全片段数组 */
export function parseRichInline(text: string): RichInlineSegment[] {
  if (!text) return [];
  const regex = /<(em|b)>(.*?)<\/\1>/g;
  const result: RichInlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    result.push({ type: match[1] as "em" | "b", content: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ type: "text", content: text.slice(lastIndex) });
  }
  return result;
}

/** 文字里的 @ 提及片段 */
export interface MentionSegment {
  type: "text" | "user" | "doc";
  content: string;
  id?: number;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 把文字里的 “@名称” 切出来，长的名称优先匹配 */
export function splitMentions(
  text: string,
  users: UserBrief[],
  documents: DocumentRef[],
): MentionSegment[] {
  const targets = [
    ...users.map((u) => ({ type: "user" as const, id: u.id, name: u.realName })),
    ...documents.map((d) => ({ type: "doc" as const, id: d.id, name: d.name })),
  ].sort((a, b) => b.name.length - a.name.length);
  if (targets.length === 0) return [{ type: "text", content: text }];

  const pattern = new RegExp(
    `@(${targets.map((t) => escapeRegExp(t.name)).join("|")})`,
    "g",
  );
  const result: MentionSegment[] = [];
  let lastIndex = 0;
  let matched: RegExpExecArray | null;
  while ((matched = pattern.exec(text)) !== null) {
    if (matched.index > lastIndex) {
      result.push({ type: "text", content: text.slice(lastIndex, matched.index) });
    }
    const target = targets.find((item) => item.name === matched![1])!;
    result.push({ type: target.type, id: target.id, content: matched[0] });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push({ type: "text", content: text.slice(lastIndex) });
  }
  return result;
}

/** 发送前整理输入：去掉首尾空白，丢掉文字里已经不存在的 @ 对象 */
export function finalizeMention(value: MentionValue): MentionValue {
  const text = value.text.trim();
  return {
    text,
    mentions: value.mentions.filter((user) =>
      text.includes(`@${user.realName}`),
    ),
    documents: value.documents.filter((doc) => text.includes(`@${doc.name}`)),
  };
}
