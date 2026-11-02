import { taskStatusLabel } from "../../data/global";
import type { Activity } from "../../types/global";
import {
  dateToX,
  formatDayLabel,
  getAxisDays,
  getAxisTicks,
  getProjectToday,
  type AxisRange,
} from "../../utils/date";
import {
  buildTaskBar,
  type TaskBarModel,
  type TaskBarTask,
  type TimeSpan,
} from "./taskBarModel";
import "./TaskBar.css";

interface TaskBarProps {
  task: TaskBarTask;
  /** 任务的操作记录，用来推算阻塞区间 */
  activities?: Activity[];
  /** 看板里的小条：两端不留白，不画刻度和“截止 / 完成”文字 */
  compact?: boolean;
  /** 和别的任务条共用一条时间轴（时间线页）；不传则按这个任务自己算 */
  range?: AxisRange;
  title?: string;
}

/** 超过这个位置的标注文字改放到线的左侧，免得超出右边界 */
const FLIP_AT = 78;

export default function TaskBar({
  task,
  activities = [],
  compact = false,
  range: sharedRange,
  title,
}: TaskBarProps) {
  const today = getProjectToday();
  const model = buildTaskBar(
    task,
    activities,
    today,
    compact ? 0 : undefined,
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
      className={`tb${compact ? " tb-compact" : ""}`}
      role="img"
      aria-label={label}
      title={title}
    >
      {!compact && (
        <div className="tb-axis" aria-hidden="true">
          {getAxisTicks(range).map((tick) => (
            <span key={tick.date} style={{ left: pct(tick.date) }}>
              {tick.label}
            </span>
          ))}
        </div>
      )}
      <div className="tb-trk" aria-hidden="true">
        {!compact &&
          getAxisDays(range).map((date) => (
            <i key={date} className="tb-day" style={{ left: pct(date) }} />
          ))}

        {model.due && !compact && <DueMark model={model} x={x} />}

        {model.unused && (
          <i className="tb-unused" style={spanStyle(model.unused)} />
        )}
        {model.fills.map((fill, i) => (
          <i
            key={i}
            className={`tb-fill tb-${fill.kind}`}
            style={spanStyle(fill)}
          />
        ))}
        {model.frames.map((frame, i) => (
          <i
            key={i}
            className={`tb-frame${frame.dashed ? " dashed" : ""}${frame.tail ? " tail" : ""}`}
            style={spanStyle(frame)}
          />
        ))}

        <i className="tb-now" style={{ left: pct(model.today) }} />

        {model.done && (
          <>
            <i className="tb-done" style={{ left: pct(model.done.at) }} />
            {!compact && (
              <i
                className={`tb-lb tb-lb-done${x(model.done.at) > FLIP_AT ? " flip" : ""}`}
                style={{ left: pct(model.done.at) }}
              >
                完成 {formatDayLabel(model.done.date)}
              </i>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** 截止线和“截止 MM.DD”；未完成且已逾期的标注用橙色 */
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
  return (
    <>
      <i className="tb-cap" style={{ left }} />
      <i
        className={`tb-lb tb-lb-due${late ? " late" : ""}${x(due.at) > FLIP_AT ? " flip" : ""}`}
        style={{ left }}
      >
        截止 {formatDayLabel(due.date)}
      </i>
    </>
  );
}
