import { taskTimeline } from "../../../../../data/task";
import type { TaskDetail } from "../../../../../types/task";
import { formatMonthDay, timelineOffset, timelinePercent } from "../../utils";

interface TaskTimelineProps {
  task: TaskDetail;
  today: string;
}

function TimelineBar({
  kind,
  from,
  to,
}: {
  kind: string;
  from: number;
  to: number;
}) {
  const left = timelinePercent(from);
  return (
    <i
      className={`b ${kind}`}
      style={{ left, width: `calc(${timelinePercent(to)} - ${left})` }}
    />
  );
}

export default function TaskTimeline({ task, today }: TaskTimelineProps) {
  const todayOffset = timelineOffset(today);
  const late = task.overdueDays > 0;

  const renderBars = () => {
    if (!task.planStart || !task.dueDate) return null;
    const start = Math.max(0, timelineOffset(task.planStart));
    const dueEnd = timelineOffset(task.dueDate) + 1;

    if (task.status === "DONE" || task.status === "TODO") {
      return (
        <TimelineBar
          kind={task.status.toLowerCase()}
          from={start}
          to={dueEnd}
        />
      );
    }
    return (
      <>
        <TimelineBar
          kind="on"
          from={start}
          to={late ? dueEnd : todayOffset + 1}
        />
        {late && <TimelineBar kind="over" from={dueEnd} to={todayOffset + 1} />}
      </>
    );
  };

  return (
    <div className="tt">
      <div className="dx-axis">
        {taskTimeline.ticks.map((tick) => (
          <span
            key={tick}
            style={{ left: timelinePercent(timelineOffset(tick)) }}
          >
            {formatMonthDay(tick)}
          </span>
        ))}
      </div>
      <div className="trk tt-trk">
        <i
          className="now"
          style={{ left: timelinePercent(todayOffset + 0.5) }}
        />
        {task.dueDate && (
          <>
            <i
              className="cap"
              style={{
                left: timelinePercent(timelineOffset(task.dueDate) + 1),
              }}
            />
            <i
              className={`duelb${late ? " late" : ""}`}
              style={{
                left: timelinePercent(timelineOffset(task.dueDate) + 1),
              }}
            >
              截止 {formatMonthDay(task.dueDate)}
            </i>
          </>
        )}
        {renderBars()}
      </div>
    </div>
  );
}
