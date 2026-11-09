import type { TaskDetail } from "../../../../types/task";
import { formatMonthDay } from "../../../../utils/date";

interface BlockedByProps {
  tasks: TaskDetail[];
  onOpenTask: (taskId: number) => void;
}

export default function BlockedBy({ tasks, onOpenTask }: BlockedByProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="bby">
      <span className="k t-kicker">// BLOCKING</span>
      {tasks.map((task) => (
        <div className="r" key={task.id} onClick={() => onOpenTask(task.id)}>
          <b>{task.title}</b>
          <span>{task.dueDate ? formatMonthDay(task.dueDate) : "—"}</span>
        </div>
      ))}
    </div>
  );
}
