import { Badge } from "../../../components/ui/Badge";
import type { DiscussionBrief, DiscussionTask } from "../../../shared/types/collab";
import { formatThreadShortTime } from "../utils/format";
import styles from "./ThreadItem.module.css";

interface ThreadItemProps {
  brief: DiscussionBrief;
  task: DiscussionTask | null;
  active: boolean;
  today: string;
  onSelect: (id: number) => void;
}

export function ThreadItem({
  brief,
  task,
  active,
  today,
  onSelect,
}: ThreadItemProps) {
  const overdue = task?.overdueDays ?? 0;
  const closed = task?.status === "DONE";
  const taskLabel = brief.task ? brief.task.title : "未关联任务";
  const rightTime = formatThreadShortTime(brief.lastCommentAt, today);

  return (
    <button
      type="button"
      className={styles.item}
      data-closed={closed ? "true" : undefined}
      aria-current={active ? "true" : undefined}
      onClick={() => onSelect(brief.id)}
    >
      <div className={styles.top}>
        <span className={styles.title}>{brief.title}</span>
        {overdue > 0 && (
          <Badge variant="accent" size="sm" className={styles.badge}>
            逾期 {overdue} 天
          </Badge>
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.task}>{taskLabel}</span>
        <span className={styles.time}>
          {brief.commentCount} 条{rightTime ? ` · ${rightTime}` : ""}
        </span>
      </div>
    </button>
  );
}
