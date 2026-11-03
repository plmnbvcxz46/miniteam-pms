import type { ScheduleRowData } from "../../utils";

/** 一条任务条的高度和叠放时的行间距（px） */
const BAR_HEIGHT = 26;
const BAR_GAP = 4;

interface ScheduleRowProps {
  row: ScheduleRowData;
  onOpen: (taskId: number) => void;
}

export default function ScheduleRow({ row, onOpen }: ScheduleRowProps) {
  const laneHeight = row.lanes * BAR_HEIGHT + (row.lanes - 1) * BAR_GAP;
  return (
    <div className="row">
      <span className="who">{row.user.realName}</span>
      <div className="lane" style={{ height: laneHeight }}>
        {row.bars.map((bar) => (
          <button
            key={bar.task.id}
            className={`bar ${bar.tone}`}
            type="button"
            title={bar.task.title}
            style={{
              left: `${bar.left}%`,
              width: `${bar.width}%`,
              top: bar.lane * (BAR_HEIGHT + BAR_GAP),
              height: BAR_HEIGHT,
            }}
            onClick={() => onOpen(bar.task.id)}
          >
            {bar.tone === "stuck" ? (
              <span>{bar.task.title}</span>
            ) : (
              bar.task.title
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
