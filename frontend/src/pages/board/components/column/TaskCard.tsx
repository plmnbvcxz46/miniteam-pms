import type { CSSProperties, PointerEvent } from "react";
import TaskBar from "../../../../components/TaskBar/TaskBar";
import { taskTodayDate } from "../../../../data/task";
import type { TaskDetail } from "../../../../types/task";
import { useTaskStore } from "../../taskStore";
import { formatMonthDay } from "../../task/utils";

const SCORE_CLASS: Record<string, string> = {
  高: "p-h",
  中: "p-m",
  低: "p-l",
};

interface TaskCardProps {
  task: TaskDetail;
  className?: string;
  style?: CSSProperties;
  onPointerDown?: (e: PointerEvent<HTMLElement>) => void;
  onClick?: () => void;
}

function CardDue({ task }: { task: TaskDetail }) {
  if (task.overdueDays > 0) {
    return <span className="late">逾期 {task.overdueDays} 天</span>;
  }
  if (task.status !== "DONE" && task.dueDate === taskTodayDate) {
    return <span className="now">今天</span>;
  }
  const date = task.actualEnd ?? task.dueDate;
  return <span>{date ? formatMonthDay(date) : "—"}</span>;
}

export default function TaskCard({
  task,
  className = "",
  style,
  onPointerDown,
  onClick,
}: TaskCardProps) {
  const { activityMap } = useTaskStore();
  const { label, score } = task.priority;

  return (
    <article
      className={`card${task.critical ? " crit" : ""} ${className}`.trim()}
      style={style}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <div className="top">
        {task.critical ? (
          <span className="tag crit">■ 关键路径</span>
        ) : (
          <span className="tag">T-{task.taskNo}</span>
        )}
        {task.status !== "DONE" && (
          <span
            className={`score ${SCORE_CLASS[label]}`}
            title={`优先级得分 ${score}`}
          >
            {label}
            <small>{score}</small>
          </span>
        )}
      </div>
      <span className="title">{task.title}</span>
      {task.status === "DOING" && (
        <TaskBar
          task={task}
          activities={activityMap[task.id]}
          compact
          title={`进度 ${task.progress}%`}
        />
      )}
      <div className="meta">
        <span>{task.assignee?.realName ?? "未分配"}</span>
        <CardDue task={task} />
      </div>
    </article>
  );
}
