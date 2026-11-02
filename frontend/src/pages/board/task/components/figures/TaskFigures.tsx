import type { TaskDetail } from "../../../../../types/task";
import { formatMonthDay } from "../../utils";
import FigureItem from "./FigureItem";

interface TaskFiguresProps {
  task: TaskDetail;
}

export default function TaskFigures({ task }: TaskFiguresProps) {
  const waitingCount = task.successors.filter(
    (dep) => dep.status !== "DONE",
  ).length;

  return (
    <div className="figures">
      <FigureItem label="ESTIMATE" value={task.planDays} unit="工作日" />
      <FigureItem label="SPENT" value={task.usedDays} unit="工作日" />
      <FigureItem
        label="DEADLINE"
        value={task.dueDate ? formatMonthDay(task.dueDate) : "—"}
        alert={task.overdueDays > 0}
      />
      <FigureItem label="WAITING" value={waitingCount} unit="项" />
    </div>
  );
}
