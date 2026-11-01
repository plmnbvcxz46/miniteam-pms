import { taskStatusLabel } from "../../../../../data/global";
import { taskStatusKey } from "../../../../../data/task";
import type { TaskStatus } from "../../../../../types/global";
import type { TaskDetail } from "../../../../../types/task";
import StatusChips from "./StatusChips";

interface TaskHeaderProps {
  task: TaskDetail;
  onBack: () => void;
  onChangeStatus: (status: TaskStatus) => void;
  onEdit: () => void;
}

export default function TaskHeader({
  task,
  onBack,
  onChangeStatus,
  onEdit,
}: TaskHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">
          <button className="tk-back" type="button" onClick={onBack}>
            返回
          </button>
          <span className="tk-crumb">
            任务 / {task.milestone?.name ?? "未归入阶段"}
          </span>
        </div>
        <h1 className="vt">{task.title}</h1>
        <p className="tk-meta">
          <span className="st">
            <i className={`key ${taskStatusKey[task.status]}`} />
            {taskStatusLabel[task.status]}
          </span>
          {task.overdueDays > 0 && (
            <span className="late">逾期 {task.overdueDays} 天</span>
          )}
          <span>负责人 {task.assignee?.realName ?? "未分配"}</span>
          {task.status !== "DONE" && (
            <span>
              优先级 {task.priority.label} · {task.priority.score}
            </span>
          )}
          {task.critical && <span className="crit">在关键路径上</span>}
        </p>
      </div>
      <div className="va tk-acts">
        <StatusChips status={task.status} onChange={onChangeStatus} />
        <button className="btn" type="button" onClick={onEdit}>
          编辑
        </button>
      </div>
    </div>
  );
}
