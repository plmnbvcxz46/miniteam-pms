import type { DiscussionBrief } from "../../../../types/collab";
import { useIssue } from "../../../../state/issue/useIssue";
import { formatThreadShortTime } from "../../utils";

interface ThreadItemProps {
  discussion: DiscussionBrief;
  isSelected: boolean;
  isClosed: boolean;
  overdueDays: number;
  onClick: () => void;
}

export default function ThreadItem({
  discussion,
  isSelected,
  isClosed,
  overdueDays,
  onClick,
}: ThreadItemProps) {
  const { today } = useIssue();
  const classNames = ["thr", isClosed ? "closed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      aria-current={isSelected ? "true" : undefined}
      onClick={onClick}
    >
      <div className="thr-top">
        <b>{discussion.title}</b>
        {overdueDays > 0 && (
          <span className="thr-late">逾期 {overdueDays} 天</span>
        )}
      </div>
      <small>
        <span>{discussion.task?.title ?? "未关联任务"}</span>
        <span>
          {discussion.commentCount} 条 ·{" "}
          {formatThreadShortTime(discussion.lastCommentAt, today)}
        </span>
      </small>
    </button>
  );
}
