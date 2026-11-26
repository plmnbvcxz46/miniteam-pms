import type { ReactNode } from "react";
import type { Comment } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import {
  formatMessageTime,
  parseRichInline,
  splitMentions,
} from "../utils/format";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  comment: Comment;
  mentionUsers: UserBrief[];
  taskDocuments: DocumentRef[];
  today: string;
  flashTriggerKey: number;
  onOpenDocument: (docId: number) => void;
}

function mergeById<T extends { id: number }>(primary: T[], extra: T[]): T[] {
  const seen = new Set<number>();
  const merged: T[] = [];
  for (const item of [...primary, ...extra]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

function renderMessageBody(
  comment: Comment,
  mentionUsers: UserBrief[],
  taskDocuments: DocumentRef[],
  onOpenDocument: (docId: number) => void,
): ReactNode {
  const users = mergeById(comment.mentions, mentionUsers);
  const docs = mergeById(comment.documents, taskDocuments);
  const availableDocIds = new Set(taskDocuments.map((d) => d.id));

  return parseRichInline(comment.content).map((seg, segIndex) => {
    if (seg.type === "em") {
      return (
        <em key={segIndex} className={styles.em}>
          {seg.content}
        </em>
      );
    }
    if (seg.type === "b") {
      return (
        <strong key={segIndex} className={styles.bold}>
          {seg.content}
        </strong>
      );
    }
    return splitMentions(seg.content, users, docs).map((part, partIndex) => {
      const key = `${segIndex}-${partIndex}`;
      if (part.type === "user") {
        return (
          <span key={key} className={styles.mention}>
            {part.content}
          </span>
        );
      }
      if (part.type === "doc" && part.id !== undefined) {
        if (availableDocIds.has(part.id)) {
          return (
            <button
              key={key}
              type="button"
              className={styles.docTag}
              title="查看文件"
              onClick={() => onOpenDocument(part.id!)}
            >
              {part.content}
            </button>
          );
        }
        return (
          <span
            key={key}
            className={styles.docGone}
            title="该文件已移出此任务或已删除"
          >
            {part.content}
          </span>
        );
      }
      return part.content;
    });
  });
}

export function MessageItem({
  comment,
  mentionUsers,
  taskDocuments,
  today,
  flashTriggerKey,
  onOpenDocument,
}: MessageItemProps) {
  return (
    <article
      className={styles.message}
      data-comment-id={comment.id}
      tabIndex={-1}
    >
      <div
        key={flashTriggerKey}
        className={styles.inner}
        data-flash={flashTriggerKey > 0 ? "true" : undefined}
      >
        <div className={styles.head}>
          <span className={styles.user}>{comment.user.realName}</span>
          <span className={styles.time}>
            {formatMessageTime(comment.createdAt, today)}
          </span>
        </div>
        <div className={styles.body}>
          {renderMessageBody(comment, mentionUsers, taskDocuments, onOpenDocument)}
        </div>
      </div>
    </article>
  );
}
