import type { DiscussionTask } from "../../../shared/types/collab";
import { getTaskStatusNote } from "../utils/format";
import styles from "./ThreadTaskMeta.module.css";

interface ThreadTaskMetaProps {
  task: DiscussionTask;
  onTaskClick: (taskId: number) => void;
}

export function ThreadTaskMeta({ task, onTaskClick }: ThreadTaskMetaProps) {
  const isRisk = task.overdueDays > 0 || task.status === "BLOCKED";
  const note = getTaskStatusNote(task);

  return (
    <div
      className={styles.bar}
      data-risk={isRisk ? "true" : undefined}
    >
      <span
        className={styles.swatch}
        data-status={task.status}
        aria-hidden="true"
      />
      <span className={styles.prefix}>关联任务</span>
      <button
        type="button"
        className={styles.link}
        onClick={() => onTaskClick(task.id)}
      >
        {task.title}
      </button>
      {note && (
        <span
          className={styles.note}
          data-risk={isRisk ? "true" : undefined}
          data-overdue={task.overdueDays > 0 ? "true" : undefined}
        >
          {note}
        </span>
      )}
    </div>
  );
}
