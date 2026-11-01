import { Fragment } from "react";
import type { Comment } from "../../../../types/collab";
import { formatMessageTime, parseRichInline } from "../../utils";

interface MessageItemProps {
  comment: Comment;
  isFlashing?: boolean;
}

export default function MessageItem({
  comment,
  isFlashing = false,
}: MessageItemProps) {
  const segments = parseRichInline(comment.content);

  const classNames = ["msg", isFlashing ? "msg-flash" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classNames} data-comment-id={comment.id} tabIndex={-1}>
      <header>
        <b>{comment.user.realName}</b>
        <time>{formatMessageTime(comment.createdAt)}</time>
      </header>
      <p>
        {segments.map((seg, idx) => {
          if (seg.type === "em") {
            return <em key={idx}>{seg.content}</em>;
          }
          if (seg.type === "b") {
            return <b key={idx}>{seg.content}</b>;
          }
          return <Fragment key={idx}>{seg.content}</Fragment>;
        })}
      </p>
    </article>
  );
}
