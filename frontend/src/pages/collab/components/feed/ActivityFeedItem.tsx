import { Fragment } from "react";
import type { Activity } from "../../../../types/global";
import { formatMessageTime, parseRichInline } from "../../utils";

interface ActivityFeedItemProps {
  activity: Activity;
  targetDiscussionId: number | null;
  isActive?: boolean;
  onSelectDiscussion?: (discussionId: number) => void;
}

export default function ActivityFeedItem({
  activity,
  targetDiscussionId,
  isActive = false,
  onSelectDiscussion,
}: ActivityFeedItemProps) {
  const segments = parseRichInline(activity.detail);
  const isClickable = targetDiscussionId !== null;

  const classNames = [
    "ev",
    isClickable ? "clickable" : "",
    isActive ? "active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelectDiscussion?.(targetDiscussionId);
    }
  };

  return (
    <div
      className={classNames}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={isClickable ? "点击切换到对应讨论" : undefined}
      onClick={
        isClickable
          ? () => onSelectDiscussion?.(targetDiscussionId)
          : undefined
      }
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      <time>{formatMessageTime(activity.createdAt)}</time>
      <p>
        {segments.map((seg, idx) => {
          if (seg.type === "b") return <b key={idx}>{seg.content}</b>;
          if (seg.type === "em") return <em key={idx}>{seg.content}</em>;
          return <Fragment key={idx}>{seg.content}</Fragment>;
        })}
      </p>
    </div>
  );
}
