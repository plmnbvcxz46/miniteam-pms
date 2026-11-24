import { TaskBar } from "../../../components/patterns/TaskBar";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import type { AxisRange } from "../../../shared/utils/date";
import type { CpmRow } from "../utils";
import styles from "./GanttRow.module.css";

interface GanttRowProps {
  task: TaskDetail;
  activities: Activity[];
  range: AxisRange;
  width: number;
  today: string;
  cpm: CpmRow;
  last: boolean;
  onOpen: (taskId: number) => void;
  onHover: (taskId: number | null) => void;
}

export default function GanttRow({
  task,
  activities,
  range,
  width,
  today,
  cpm,
  last,
  onOpen,
  onHover,
}: GanttRowProps) {
  const critical = cpm.slack === 0;
  const hoverName = {
    onMouseEnter: () => onHover(task.id),
    onMouseLeave: () => onHover(null),
  };

  return (
    <div
      className={styles.row}
      data-last={last ? "true" : undefined}
      onFocus={() => onHover(task.id)}
      onBlur={() => onHover(null)}
    >
      <button
        className={styles.nameButton}
        type="button"
        data-critical={critical ? "true" : undefined}
        onClick={() => onOpen(task.id)}
      >
        <b className={styles.title} {...hoverName}>
          {task.title}
        </b>
        <small className={styles.meta} {...hoverName}>
          {task.assignee?.realName ?? "未分配"} · {task.planDays} 天
        </small>
      </button>
      <div
        className={styles.lane}
        style={{ width }}
        onMouseOver={(e) =>
          onHover(
            (e.target as Element).closest("[data-taskbar-hit]")
              ? task.id
              : null,
          )
        }
        onMouseLeave={() => onHover(null)}
      >
        <TaskBar
          task={task}
          today={today}
          activities={activities}
          range={range}
          variant="gantt"
        />
      </div>
    </div>
  );
}
