import { ListRow } from "../../../components/patterns/ListRow";
import { taskStatusLabel } from "../../../shared/constants/task";
import type { DependencyTask } from "../../../shared/types/task";
import StatusKey from "./StatusKey";

interface DependencyRowProps {
  dep: DependencyTask;
  onOpenTask: (taskId: number) => void;
}

export default function DependencyRow({ dep, onOpenTask }: DependencyRowProps) {
  return (
    <ListRow
      density="compact"
      leading={<StatusKey status={dep.status} />}
      title={dep.task.title}
      meta={dep.assignee?.realName ?? "未分配"}
      trailing={taskStatusLabel[dep.status]}
      onClick={() => onOpenTask(dep.task.id)}
    />
  );
}
