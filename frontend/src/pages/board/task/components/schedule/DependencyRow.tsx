import { taskStatusLabel } from "../../../../../constants/task";
import { taskStatusKey } from "../../../../../constants/task";
import type { DependencyTask } from "../../../../../types/task";

interface DependencyRowProps {
  dep: DependencyTask;
  onOpenTask: (taskId: number) => void;
}

export default function DependencyRow({ dep, onOpenTask }: DependencyRowProps) {
  return (
    <button
      type="button"
      className="dep"
      onClick={() => onOpenTask(dep.task.id)}
    >
      <i className={`key ${taskStatusKey[dep.status]}`} />
      <b>{dep.task.title}</b>
      <small>{dep.assignee?.realName ?? "未分配"}</small>
      <span className="s">{taskStatusLabel[dep.status]}</span>
    </button>
  );
}
