import type { DiscussionBrief } from "../../../../types/collab";
import { formatThreadShortTime } from "../../utils";

interface ThreadItemProps {
  discussion: DiscussionBrief;
  isSelected: boolean;
  isUnread: boolean;
  isClosed: boolean;
  onClick: () => void;
}

export default function ThreadItem({
  discussion,
  isSelected,
  isUnread,
  isClosed,
  onClick,
}: ThreadItemProps) {
  const classNames = ["thr", isUnread ? "unread" : "", isClosed ? "closed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      aria-current={isSelected ? "true" : undefined}
      onClick={onClick}
    >
      <b>{discussion.title}</b>
      <small>
        <span>{discussion.task?.title ?? "未关联任务"}</span>
        <span>
          {discussion.commentCount} 条 ·{" "}
          {formatThreadShortTime(discussion.lastCommentAt)}
        </span>
      </small>
    </button>
  );
}
