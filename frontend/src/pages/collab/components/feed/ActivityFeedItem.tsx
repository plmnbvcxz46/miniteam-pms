import { Fragment } from "react";
import type { Activity } from "../../../../types/global";
import { formatMessageTime, parseRichInline } from "../../utils";

interface ActivityFeedItemProps {
  activity: Activity;
  targetDiscussionId: number | null;
  isActive?: boolean;
  onSelectActivity?: (activity: Activity) => void;
}

export default function ActivityFeedItem({
  activity,
  targetDiscussionId,
  isActive = false,
  onSelectActivity,
}: ActivityFeedItemProps) {
  const segments = parseRichInline(activity.detail);
  const title =
    targetDiscussionId !== null ? "点击切换到对应讨论" : "点击发起相关讨论";

  const classNames = ["ev", "clickable", isActive ? "active" : ""]
    .filter(Boolean)
    .join(" ");

  const handleSelect = () => {
    onSelectActivity?.(activity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      className={classNames}
      role="button"
      tabIndex={0}
      title={title}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
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
