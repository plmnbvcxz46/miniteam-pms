import { taskStatusLabel } from "../../../shared/constants/task";
import type { Activity } from "../../../shared/types/global";
import {
  dateToX,
  formatDayLabel,
  getAxisDays,
  getAxisTicks,
  type AxisRange,
} from "../../../shared/utils/date";
import styles from "./TaskBar.module.css";
import {
  buildTaskBar,
  type BarFill,
  type BarFrame,
  type TaskBarModel,
  type TaskBarTask,
  type TimeSpan,
} from "./taskBarModel";

export type TaskBarVariant = "full" | "compact" | "gantt";

export interface TaskBarProps {
  task: TaskBarTask;
  /** 今天 yyyy-MM-dd（受控传入，内部不读 Store） */
  today: string;
  /** 任务的操作记录，用来推算阻塞区间 */
  activities?: Activity[];
  /** full 详情页完整条 / compact 看板小条 / gantt 时间线共用轨道 */
  variant?: TaskBarVariant;
  /** 和别的任务条共用一条时间轴（时间线页）；不传则按这个任务自己算 */
  range?: AxisRange;
  title?: string;
  className?: string;
}

const FLIP_AT = 78;

const FILL_CLASS: Record<BarFill["kind"], string> = {
  ink: styles.fillInk,
  warn: styles.fillWarn,
  past: styles.fillPast,
};

function DueMark({
  model,
  x,
}: {
  model: TaskBarModel;
  x: (time: number) => number;
}) {
  const { due, today } = model;
  if (!due) return null;
  const late = !model.done && today > due.at;
  const left = `${x(due.at)}%`;
  const flip = x(due.at) > FLIP_AT;

  return (
    <>
      <span className={styles.cap} style={{ left }} />
      <span
        className={`${styles.label} ${styles.labelDue}`}
        data-late={late ? "true" : undefined}
        data-flip={flip ? "true" : undefined}
        style={{ left }}
      >
        截止 {formatDayLabel(due.date)}
      </span>
    </>
  );
}

function BarFrames({
  frames,
  spanStyle,
}: {
  frames: BarFrame[];
  spanStyle: (span: TimeSpan) => { left: string; width: string };
}) {
  return (
    <>
      {frames.map((frame, i) => (
        <span
          key={i}
          className={styles.frame}
          data-taskbar-hit="true"
          data-dashed={frame.dashed ? "true" : undefined}
          data-tail={frame.tail ? "true" : undefined}
          style={spanStyle(frame)}
        />
      ))}
    </>
  );
}

function BarFills({
  fills,
  spanStyle,
}: {
  fills: BarFill[];
  spanStyle: (span: TimeSpan) => { left: string; width: string };
}) {
  return (
    <>
      {fills.map((fill, i) => (
        <span
          key={i}
          className={`${styles.fill} ${FILL_CLASS[fill.kind]}`}
          data-taskbar-hit="true"
          style={spanStyle(fill)}
        />
      ))}
    </>
  );
}

function DoneMark({
  done,
  isCompact,
  x,
  pct,
}: {
  done: TaskBarModel["done"];
  isCompact: boolean;
  x: (time: number) => number;
  pct: (time: number) => string;
}) {
  if (!done) return null;
  return (
    <>
      <span className={styles.done} style={{ left: pct(done.at) }} />
      {!isCompact && (
        <span
          className={`${styles.label} ${styles.labelDone}`}
          data-flip={x(done.at) > FLIP_AT ? "true" : undefined}
          style={{ left: pct(done.at) }}
        >
          完成 {formatDayLabel(done.date)}
        </span>
      )}
    </>
  );
}

function AxisTicks({
  range,
  pct,
}: {
  range: AxisRange;
  pct: (time: Parameters<typeof dateToX>[0]) => string;
}) {
  return (
    <div className={styles.axis} aria-hidden="true">
      {getAxisTicks(range).map((tick) => (
        <span
          key={tick.date}
          className={styles.axisLabel}
          style={{ left: pct(tick.date) }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}

/** 受控任务生命周期进度条（full / compact / gantt） */
export function TaskBar({
  task,
  today,
  activities = [],
  variant = "full",
  range: sharedRange,
  title,
  className,
}: TaskBarProps) {
  const isCompact = variant !== "full";
  const model = buildTaskBar(
    task,
    activities,
    today,
    isCompact ? 0 : undefined,
    sharedRange,
  );
  if (!model) return null;

  const { range } = model;
  const x = (time: Parameters<typeof dateToX>[0]) => dateToX(time, range, 100);
  const pct = (time: Parameters<typeof dateToX>[0]) => `${x(time)}%`;
  const spanStyle = ({ from, to }: TimeSpan) => ({
    left: pct(from),
    width: `${x(to) - x(from)}%`,
  });
  const label = `${taskStatusLabel[task.status]}，计划 ${formatDayLabel(task.planStart!)} 至 ${formatDayLabel(task.dueDate!)}`;

  return (
    <div
      className={className ? `${styles.root} ${className}` : styles.root}
      data-variant={variant}
      role="img"
      aria-label={label}
      title={title}
    >
      {!isCompact && <AxisTicks range={range} pct={pct} />}

      <div className={styles.track} aria-hidden="true">
        {!isCompact &&
          getAxisDays(range).map((date) => (
            <span
              key={date}
              className={styles.day}
              style={{ left: pct(date) }}
            />
          ))}

        {model.due && !isCompact && <DueMark model={model} x={x} />}

        {model.unused && (
          <span className={styles.unused} style={spanStyle(model.unused)} />
        )}

        {variant === "gantt" ? (
          <>
            <BarFrames frames={model.frames} spanStyle={spanStyle} />
            <BarFills fills={model.fills} spanStyle={spanStyle} />
          </>
        ) : (
          <>
            <BarFills fills={model.fills} spanStyle={spanStyle} />
            <BarFrames frames={model.frames} spanStyle={spanStyle} />
          </>
        )}

        <span className={styles.now} style={{ left: pct(model.today) }} />
        <DoneMark done={model.done} isCompact={isCompact} x={x} pct={pct} />
      </div>
    </div>
  );
}
