import {
  dateToX,
  formatDayLabel,
  getAxisDays,
  addDays,
  type AxisRange,
} from "../../../../utils/date";
import { getWeekStarts } from "../../utils";

interface GanttAxisProps {
  range: AxisRange;
  /** 横轴总宽度（px） */
  width: number;
  today: string;
  /** 按周显示每一天的日号，按月只留每周一的标签 */
  showDays: boolean;
}

/** 周末的日期 */
function isWeekend(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

export default function GanttAxis({
  range,
  width,
  today,
  showDays,
}: GanttAxisProps) {
  const x = (date: string) => dateToX(date, range, width);
  const dayWidth = width / (range.end - range.start);

  return (
    <div className="gt-axis" style={{ width }}>
      {getWeekStarts(range).map((monday) => (
        <span
          key={monday}
          className="gt-wk"
          style={{ left: x(monday), width: dayWidth * 7 }}
        >
          {formatDayLabel(monday)} – {formatDayLabel(addDays(monday, 6))}
        </span>
      ))}
      {showDays &&
        getAxisDays(range).map((date) => (
          <span
            key={date}
            className={`gt-d${isWeekend(date) ? " off" : ""}${date === today ? " today" : ""}`}
            style={{ left: x(date), width: dayWidth }}
          >
            {Number(date.slice(8))}
          </span>
        ))}
    </div>
  );
}
