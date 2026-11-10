import TaskBar from "../../../shared/components/TaskBar";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import type { AxisRange } from "../../../shared/utils/date";
import type { CpmRow } from "../utils";

interface GanttRowProps {
  task: TaskDetail;
  activities: Activity[];
  range: AxisRange;
  /** 横轴总宽度（px） */
  width: number;
  cpm: CpmRow;
  last: boolean;
  onOpen: (taskId: number) => void;
  /** 鼠标移入或键盘聚焦这一行 / 离开（null） */
  onHover: (taskId: number | null) => void;
}

export default function GanttRow({
  task,
  activities,
  range,
  width,
  cpm,
  last,
  onOpen,
  onHover,
}: GanttRowProps) {
  const critical = cpm.slack === 0;

  return (
    <div
      className={`gt-row${last ? " last" : ""}`}
      onMouseEnter={() => onHover(task.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(task.id)}
      onBlur={() => onHover(null)}
    >
      <button
        className={`gt-name${critical ? " crit" : ""}`}
        type="button"
        onClick={() => onOpen(task.id)}
      >
        <b>{task.title}</b>
        <small>
          {task.assignee?.realName ?? "未分配"} · {task.planDays} 天
        </small>
      </button>
      <div className="gt-lane" style={{ width }}>
        <TaskBar task={task} activities={activities} range={range} compact />
      </div>
    </div>
  );
}
