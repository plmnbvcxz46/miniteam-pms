import { EmptyState } from "../../../components/patterns/EmptyState";
import { ListRow } from "../../../components/patterns/ListRow";
import { Panel } from "../../../components/patterns/Panel";
import { Badge } from "../../../components/ui/Badge";
import {
  taskStatusLabel,
  taskStatusOrder,
} from "../../../shared/constants/task";
import type { TaskStatus } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { formatMonthDay } from "../../../shared/utils/date";
import styles from "./SelfTasks.module.css";

interface SelfTasksProps {
  tasks: TaskDetail[];
  className?: string;
}

/** 未完成的任务：逾期最久的在前，其次关键路径上的，再按截止日 */
function sortOpenTasks(tasks: TaskDetail[]): TaskDetail[] {
  return tasks
    .filter((task) => task.status !== "DONE")
    .sort(
      (a, b) =>
        b.overdueDays - a.overdueDays ||
        Number(b.critical) - Number(a.critical) ||
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
    );
}

function SelfTaskStats({ counts }: { counts: Record<TaskStatus, number> }) {
  return (
    <ul className={styles.stat} aria-label="按状态统计">
      {taskStatusOrder.map((status) => (
        <li
          key={status}
          className={styles.statCell}
          data-zero={counts[status] === 0 ? "true" : undefined}
        >
          <span className={styles.statLabel}>
            <i
              className={styles.swatch}
              data-status={status}
              aria-hidden="true"
            />
            {taskStatusLabel[status]}
          </span>
          <b className={styles.statNum}>{counts[status]}</b>
        </li>
      ))}
    </ul>
  );
}

function SelfTaskRow({ task }: { task: TaskDetail }) {
  const dueText =
    task.overdueDays > 0
      ? `逾期 ${task.overdueDays} 天`
      : task.dueDate
        ? formatMonthDay(task.dueDate)
        : "—";

  return (
    <li>
      <ListRow
        to={`/board/task?id=${task.id}`}
        density="compact"
        tone={task.overdueDays > 0 ? "alert" : "default"}
        leading={
          <>
            <span className={styles.taskNo}>T-{task.taskNo}</span>
            <span className={styles.taskStatus}>
              <i
                className={styles.swatch}
                data-status={task.status}
                aria-hidden="true"
              />
              {taskStatusLabel[task.status]}
            </span>
          </>
        }
        title={task.title}
        trailing={
          <>
            {task.critical && (
              <Badge variant="solid" size="sm">
                关键
              </Badge>
            )}
            <span>{dueText}</span>
          </>
        }
      />
    </li>
  );
}

export default function SelfTasks({ tasks, className }: SelfTasksProps) {
  const counts = Object.fromEntries(
    taskStatusOrder.map((status) => [
      status,
      tasks.filter((task) => task.status === status).length,
    ]),
  ) as Record<TaskStatus, number>;
  const openTasks = sortOpenTasks(tasks);

  return (
    <Panel
      kicker="// TASKS"
      title="负责任务"
      headerRight={<span className={styles.total}>{tasks.length}</span>}
      className={className}
    >
      <SelfTaskStats counts={counts} />

      {openTasks.length > 0 ? (
        <ul className={styles.list} aria-label="未完成的任务">
          {openTasks.map((task) => (
            <SelfTaskRow key={task.id} task={task} />
          ))}
        </ul>
      ) : (
        <div className={styles.emptyWrap}>
          <EmptyState variant="compact" description="暂无未完成任务" />
        </div>
      )}
    </Panel>
  );
}
