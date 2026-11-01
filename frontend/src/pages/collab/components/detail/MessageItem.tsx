import { Fragment } from "react";
import type { Comment } from "../../../../types/collab";
import { formatMessageTime, parseRichInline } from "../../utils";

interface MessageItemProps {
  comment: Comment;
}

export default function MessageItem({ comment }: MessageItemProps) {
  const segments = parseRichInline(comment.content);

  return (
    <article className="msg">
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
