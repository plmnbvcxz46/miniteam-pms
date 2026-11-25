import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";

export interface MentionTrigger {
  start: number;
  end: number;
  query: string;
}

export type MentionOption =
  | { key: string; kind: "user"; name: string; sub: string; user: UserBrief }
  | { key: string; kind: "doc"; name: string; sub: string; doc: DocumentRef };

/** 识别光标前的 @ 触发片段 */
export function detectMentionTrigger(
  text: string,
  caret: number,
): MentionTrigger | null {
  const before = text.slice(0, caret);
  const match = /(^|\s)@([^\s@]*)$/.exec(before);
  if (!match) return null;
  const query = match[2];
  return { start: caret - query.length - 1, end: caret, query };
}

/** 按关键词筛选可提及的成员与任务文件 */
export function buildMentionOptions(
  users: UserBrief[],
  documents: DocumentRef[],
  query: string,
): MentionOption[] {
  const q = query.trim().toLowerCase();
  const userOpts: MentionOption[] = users
    .filter(
      (u) =>
        !q ||
        u.realName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    )
    .map((user) => ({
      key: `u-${user.id}`,
      kind: "user",
      name: user.realName,
      sub: `@${user.username}`,
      user,
    }));
  const docOpts: MentionOption[] = documents
    .filter((d) => !q || d.name.toLowerCase().includes(q))
    .map((doc) => ({
      key: `d-${doc.id}`,
      kind: "doc",
      name: doc.name,
      sub: "任务文件",
      doc,
    }));
  return [...userOpts, ...docOpts];
}

/** 选中 @ 选项后计算新文本与新光标位置 */
export function applyPickedMention(
  value: MentionValue,
  trigger: MentionTrigger,
  option: MentionOption,
): { nextValue: MentionValue; nextCaret: number } {
  const before = value.text.slice(0, trigger.start);
  const after = value.text.slice(trigger.end);
  const insert = `@${option.name} `;
  const mentions =
    option.kind === "user" &&
    !value.mentions.some((u) => u.id === option.user.id)
      ? [...value.mentions, option.user]
      : value.mentions;
  const documents =
    option.kind === "doc" &&
    !value.documents.some((d) => d.id === option.doc.id)
      ? [...value.documents, option.doc]
      : value.documents;
  return {
    nextValue: { text: `${before}${insert}${after}`, mentions, documents },
    nextCaret: before.length + insert.length,
  };
}
