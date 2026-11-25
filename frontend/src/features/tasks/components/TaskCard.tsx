import type { CSSProperties, PointerEvent } from "react";
import { TaskBar } from "../../../components/patterns/TaskBar";
import { Badge } from "../../../components/ui/Badge";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { formatMonthDay } from "../../../shared/utils/date";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: TaskDetail;
  today: string;
  activities?: Activity[];
  dimmed?: boolean;
  fresh?: boolean;
  locked?: boolean;
  lifted?: boolean;
  floating?: boolean;
  boardDragging?: boolean;
  style?: CSSProperties;
  onPointerDown?: (e: PointerEvent<HTMLElement>) => void;
  onClick?: () => void;
}

function priorityTone(label: string): "high" | "medium" | "low" {
  if (label === "高") return "high";
  if (label === "中") return "medium";
  return "low";
}

function CardDue({ task, today }: { task: TaskDetail; today: string }) {
  if (task.overdueDays > 0) {
    return (
      <Badge variant="accent" size="sm">
        逾期 {task.overdueDays} 天
      </Badge>
    );
  }
  if (task.status !== "DONE" && task.dueDate === today) {
    return <span className={styles.dueToday}>今天</span>;
  }
  const date = task.actualEnd ?? task.dueDate;
  return <span className={styles.dueText}>{date ? formatMonthDay(date) : "—"}</span>;
}

export default function TaskCard({
  task,
  today,
  activities = [],
  dimmed = false,
  fresh = false,
  locked = false,
  lifted = false,
  floating = false,
  boardDragging = false,
  style,
  onPointerDown,
  onClick,
}: TaskCardProps) {
  const { label, score } = task.priority;

  return (
    <article
      className={styles.card}
      data-drag-card="true"
      data-status={task.status}
      data-critical={task.critical ? "true" : undefined}
      data-dimmed={dimmed ? "true" : undefined}
      data-fresh={fresh ? "true" : undefined}
      data-locked={locked ? "true" : undefined}
      data-lifted={lifted ? "true" : undefined}
      data-floating={floating ? "true" : undefined}
      data-board-dragging={boardDragging ? "true" : undefined}
      style={style}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <div className={styles.top}>
        {task.critical ? (
          <Badge variant="solid" size="sm">
            ■ 关键路径
          </Badge>
        ) : (
          <span className={styles.tag}>T-{task.taskNo}</span>
        )}
        {task.status !== "DONE" && (
          <span
            className={styles.score}
            data-level={priorityTone(label)}
            title={`优先级得分 ${score}`}
          >
            {label}
            <small>{score}</small>
          </span>
        )}
      </div>

      <span className={styles.title}>{task.title}</span>

      {task.status === "DOING" && (
        <TaskBar
          task={task}
          today={today}
          activities={activities}
          variant="compact"
          title={`进度 ${task.progress}%`}
        />
      )}

      <div className={styles.meta}>
        <span className={styles.assignee}>
          {task.assignee?.realName ?? "未分配"}
        </span>
        <CardDue task={task} today={today} />
      </div>
    </article>
  );
}
