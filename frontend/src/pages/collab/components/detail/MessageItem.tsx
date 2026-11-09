import { Fragment } from "react";
import type { Comment } from "../../../../shared/types/collab";
import { useIssue } from "../../../../state/issue/useIssue";
import { formatMessageTime, parseRichInline, splitMentions } from "../../utils";

interface MessageItemProps {
  comment: Comment;
  isFlashing?: boolean;
  /** 讨论所属任务下现有的文档 ID，不在里面的文件标签显示成不可点 */
  availableDocIds?: number[];
  onOpenDocument?: (documentId: number) => void;
}

export default function MessageItem({
  comment,
  isFlashing = false,
  availableDocIds = [],
  onOpenDocument,
}: MessageItemProps) {
  const { today } = useIssue();
  const segments = parseRichInline(comment.content);

  const classNames = ["msg", isFlashing ? "msg-flash" : ""]
    .filter(Boolean)
    .join(" ");

  const renderText = (text: string) =>
    splitMentions(text, comment.mentions, comment.documents).map((part, i) => {
      if (part.type === "user") {
        return (
          <span key={i} className="mn-tag">
            {part.content}
          </span>
        );
      }
      if (part.type === "doc") {
        const available = availableDocIds.includes(part.id!);
        return available ? (
          <button
            key={i}
            type="button"
            className="mn-tag doc"
            title="打开文档"
            onClick={() => onOpenDocument?.(part.id!)}
          >
            {part.content}
          </button>
        ) : (
          <span
            key={i}
            className="mn-tag doc gone"
            title="文档已不在这个任务下"
          >
            {part.content}
          </span>
        );
      }
      return <Fragment key={i}>{part.content}</Fragment>;
    });

  return (
    <article className={classNames} data-comment-id={comment.id} tabIndex={-1}>
      <header>
        <b>{comment.user.realName}</b>
        <time>{formatMessageTime(comment.createdAt, today)}</time>
      </header>
      <p>
        {segments.map((seg, idx) => {
          if (seg.type === "em") {
            return <em key={idx}>{seg.content}</em>;
          }
          if (seg.type === "b") {
            return <b key={idx}>{seg.content}</b>;
          }
          return <Fragment key={idx}>{renderText(seg.content)}</Fragment>;
        })}
      </p>
    </article>
  );
}
