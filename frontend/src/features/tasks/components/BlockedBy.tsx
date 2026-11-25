import { ListRow } from "../../../components/patterns/ListRow";
import type { TaskDetail } from "../../../shared/types/task";
import { formatMonthDay } from "../../../shared/utils/date";
import styles from "./BlockedBy.module.css";

interface BlockedByProps {
  tasks: TaskDetail[];
  onOpenTask: (taskId: number) => void;
}

export default function BlockedBy({ tasks, onOpenTask }: BlockedByProps) {
  if (tasks.length === 0) return null;

  return (
    <div className={styles.box}>
      <span className={styles.kicker}>// BLOCKING</span>
      <div className={styles.list}>
        {tasks.map((task) => (
          <ListRow
            key={task.id}
            density="compact"
            title={task.title}
            trailing={task.dueDate ? formatMonthDay(task.dueDate) : "—"}
            onClick={() => onOpenTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
