import {
  MetricStrip,
  type MetricStripItem,
} from "../../../components/patterns/MetricStrip";
import type { TaskDetail } from "../../../shared/types/task";
import { formatMonthDay } from "../../../shared/utils/date";

interface TaskFiguresProps {
  task: TaskDetail;
}

export default function TaskFigures({ task }: TaskFiguresProps) {
  const waitingCount = task.successors.filter(
    (dep) => dep.status !== "DONE",
  ).length;

  const items: MetricStripItem[] = [
    {
      key: "estimate",
      label: "ESTIMATE",
      value: task.planDays,
      unit: "工作日",
    },
    {
      key: "spent",
      label: "SPENT",
      value: task.usedDays,
      unit: "工作日",
    },
    {
      key: "deadline",
      label: "DEADLINE",
      value: task.dueDate ? formatMonthDay(task.dueDate) : "—",
      tone: task.overdueDays > 0 ? "alert" : "default",
    },
    {
      key: "waiting",
      label: "WAITING",
      value: waitingCount,
      unit: "项",
    },
  ];

  return <MetricStrip items={items} />;
}
