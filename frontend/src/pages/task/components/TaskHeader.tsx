import { useState } from "react";
import { taskStatusLabel } from "../../../shared/constants/task";
import { taskStatusKey } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import StatusChips from "./StatusChips";

interface TaskHeaderProps {
  task: TaskDetail;
  onBack: () => void;
  /** 没有权限改这个任务的状态时不传，状态按钮不显示 */
  onChangeStatus?: (status: TaskStatus) => void;
  /** 没有“编辑任务”权限时不传，编辑按钮不显示 */
  onEdit?: () => void;
  /** 只有项目经理和系统管理员能删，其他人不传，删除按钮不显示 */
  onDelete?: () => void;
}

export default function TaskHeader({
  task,
  onBack,
  onChangeStatus,
  onEdit,
  onDelete,
}: TaskHeaderProps) {
  // 删除要点两次，点别处就取消
  const [confirmDelete, setConfirmDelete] = useState(false);
  const taskCode = `T-${task.taskNo ?? task.id}`;

  return (
    <div className="vh">
      <div className="vl">
        <div className="k raw tk-nav">
          <button className="tk-back" type="button" onClick={onBack}>
            ← 返回
          </button>
          <span className="tk-sep" aria-hidden="true">
            |
          </span>
          <span className="tk-crumb">
            <span>任务</span>
            <span className="tk-slash" aria-hidden="true">
              /
            </span>
            <span className="tk-code">{taskCode}</span>
          </span>
        </div>
        <h1 className="vt t-page-title">{task.title}</h1>
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
      {(onChangeStatus || onEdit || onDelete) && (
        <div className="va tk-acts">
          {onChangeStatus && (
            <StatusChips status={task.status} onChange={onChangeStatus} />
          )}
          {onEdit && (
            <button className="btn" type="button" onClick={onEdit}>
              编辑
            </button>
          )}
          {onDelete && (
            <button
              className="btn risk"
              type="button"
              onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
              onBlur={() => setConfirmDelete(false)}
            >
              {confirmDelete ? "再点一次确认删除" : "删除"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
