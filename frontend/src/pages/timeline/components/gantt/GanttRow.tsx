import TaskBar from "../../../../components/TaskBar/TaskBar";
import type { Activity } from "../../../../types/global";
import type { TaskDetail } from "../../../../types/task";
import { dateToX, dayEnd, type AxisRange } from "../../../../utils/date";
import { addWorkdays, type CpmRow } from "../../utils";

interface GanttRowProps {
  task: TaskDetail;
  activities: Activity[];
  range: AxisRange;
  /** 横轴总宽度（px） */
  width: number;
  cpm: CpmRow;
  last: boolean;
  onOpen: (taskId: number) => void;
}

export default function GanttRow({
  task,
  activities,
  range,
  width,
  cpm,
  last,
  onOpen,
}: GanttRowProps) {
  const critical = cpm.slack === 0;
  // 总时差：从截止日往后推 slack 个工作日，没做完的非关键任务才画
  const showSlack = !critical && task.status !== "DONE";
  const slackFrom = dateToX(dayEnd(task.dueDate!), range, width);
  const slackTo = dateToX(
    dayEnd(addWorkdays(task.dueDate!, cpm.slack)),
    range,
    width,
  );

  return (
    <div className={`gt-row${last ? " last" : ""}`}>
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
        {showSlack && (
          <i
            className="gt-slack"
            style={{ left: slackFrom, width: slackTo - slackFrom }}
            title={`总时差 ${cpm.slack} 个工作日`}
          />
        )}
        <TaskBar task={task} activities={activities} range={range} compact />
      </div>
    </div>
  );
}
