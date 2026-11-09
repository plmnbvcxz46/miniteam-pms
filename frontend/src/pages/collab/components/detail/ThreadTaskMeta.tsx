import type { DiscussionTask } from "../../../../shared/types/collab";
import { taskStatusKey } from "../../../../shared/constants/task";
import { getTaskStatusNote } from "../../utils";

interface ThreadTaskMetaProps {
  task: DiscussionTask | null;
  onTaskClick?: (taskId: number) => void;
}

export default function ThreadTaskMeta({
  task,
  onTaskClick,
}: ThreadTaskMetaProps) {
  if (!task) return null;

  const isRisk = task.status === "BLOCKED" || task.overdueDays > 0;
  const keyClass = taskStatusKey[task.status];

  return (
    <div className={`th-meta${isRisk ? " risk" : ""}`} id="th-meta">
      <i className={`key ${keyClass}`.trim()} />
      关联任务{" "}
      <b className="lnk" onClick={() => onTaskClick?.(task.id)}>
        {task.title}
      </b>
      <span className={isRisk ? "late" : ""}>{getTaskStatusNote(task)}</span>
    </div>
  );
}
