import type { CSSProperties } from "react";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { dateToX, dayEnd, type AxisRange } from "../../../shared/utils/date";
import type { CpmResult, TimelineForecast } from "../utils";
import GanttDeps, { type DepHover } from "./GanttDeps";
import styles from "./GanttPanel.module.css";
import GanttRow from "./GanttRow";

const ROW_HEIGHT = 40;

interface GanttBodyProps {
  tasks: TaskDetail[];
  activityMap: Record<number, Activity[]>;
  cpm: CpmResult;
  forecast: TimelineForecast;
  range: AxisRange;
  width: number;
  nameWidth: number;
  today: string;
  hover: DepHover;
  onHover: (hover: DepHover) => void;
  onOpenTask: (taskId: number) => void;
}

function GanttLines({
  range,
  width,
  nameWidth,
  today,
  forecast,
}: {
  range: AxisRange;
  width: number;
  nameWidth: number;
  today: string;
  forecast: TimelineForecast;
}) {
  const x = (time: number) => nameWidth + dateToX(time, range, width);
  return (
    <>
      <div
        className={`${styles.line} ${styles.lineToday}`}
        style={{ left: x(dayEnd(today)) }}
      />
      <div
        className={`${styles.line} ${styles.linePlan}`}
        style={{ left: x(dayEnd(forecast.planEnd)) }}
      />
      {forecast.delayDays > 0 && (
        <div
          className={`${styles.line} ${styles.linePred}`}
          style={{ left: x(dayEnd(forecast.predictedEnd)) }}
        />
      )}
    </>
  );
}

export default function GanttBody({
  tasks,
  activityMap,
  cpm,
  forecast,
  range,
  width,
  nameWidth,
  today,
  hover,
  onHover,
  onOpenTask,
}: GanttBodyProps) {
  return (
    <div
      className={styles.body}
      style={{ "--gantt-name-width": `${nameWidth}px` } as CSSProperties}
    >
      <GanttDeps
        tasks={tasks}
        cpm={cpm}
        range={range}
        width={width}
        nameWidth={nameWidth}
        rowHeight={ROW_HEIGHT}
        today={today}
        hover={hover}
        onHover={onHover}
        layer="under"
      />
      {tasks.map((task, i) => (
        <GanttRow
          key={task.id}
          task={task}
          activities={activityMap[task.id] ?? []}
          range={range}
          width={width}
          today={today}
          cpm={cpm.rows[task.id]}
          last={i === tasks.length - 1}
          onOpen={onOpenTask}
          onHover={(id) => onHover(id === null ? null : { kind: "task", id })}
        />
      ))}
      <GanttLines
        range={range}
        width={width}
        nameWidth={nameWidth}
        today={today}
        forecast={forecast}
      />
      <GanttDeps
        tasks={tasks}
        cpm={cpm}
        range={range}
        width={width}
        nameWidth={nameWidth}
        rowHeight={ROW_HEIGHT}
        today={today}
        hover={hover}
        onHover={onHover}
        layer="over"
      />
    </div>
  );
}
