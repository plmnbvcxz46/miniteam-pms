import { PageHeader } from "../../../components/patterns/PageHeader";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { taskStatusLabel } from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import StatusChips from "./StatusChips";
import StatusKey from "./StatusKey";
import styles from "./TaskHeader.module.css";

interface TaskHeaderProps {
  task: TaskDetail;
  onBack: () => void;
  /** 没有权限改这个任务的状态时不传，状态按钮不显示 */
  onChangeStatus?: (status: TaskStatus) => void;
  /** 没有“编辑任务”权限时不传，编辑按钮不显示 */
  onEdit?: () => void;
  /** 只有项目经理和系统管理员能删，其他人不传，删除按钮不显示 */
  onRequestDelete?: () => void;
}

export default function TaskHeader({
  task,
  onBack,
  onChangeStatus,
  onEdit,
  onRequestDelete,
}: TaskHeaderProps) {
  const taskCode = `T-${task.taskNo ?? task.id}`;

  return (
    <PageHeader
      size="compact"
      breadcrumb={
        <div className={styles.nav}>
          <Button size="sm" variant="default" onClick={onBack}>
            ← 返回
          </Button>
          <span className={styles.sep} aria-hidden="true">
            |
          </span>
          <span className={styles.crumb}>
            <span>任务</span>
            <span className={styles.slash} aria-hidden="true">
              /
            </span>
            <span className={styles.code}>{taskCode}</span>
          </span>
        </div>
      }
      title={task.title}
      subtitle={
        <span className={styles.meta}>
          <span className={styles.status}>
            <StatusKey status={task.status} />
            {taskStatusLabel[task.status]}
          </span>
          {task.overdueDays > 0 && (
            <Badge variant="accent" size="sm">
              逾期 {task.overdueDays} 天
            </Badge>
          )}
          <span>负责人 {task.assignee?.realName ?? "未分配"}</span>
          {task.status !== "DONE" && (
            <span>
              优先级 {task.priority.label} · {task.priority.score}
            </span>
          )}
          {task.critical && (
            <span className={styles.critical}>在关键路径上</span>
          )}
        </span>
      }
      actions={
        onChangeStatus || onEdit || onRequestDelete ? (
          <div className={styles.actions}>
            {onChangeStatus && (
              <StatusChips status={task.status} onChange={onChangeStatus} />
            )}
            {onEdit && (
              <Button size="sm" variant="default" onClick={onEdit}>
                编辑
              </Button>
            )}
            {onRequestDelete && (
              <Button size="sm" variant="danger" onClick={onRequestDelete}>
                删除
              </Button>
            )}
          </div>
        ) : undefined
      }
    />
  );
}
