import {
  addDays,
  dateToX,
  formatDayLabel,
  getAxisDays,
  isWeekend,
  type AxisRange,
} from "../../../shared/utils/date";
import { getWeekStarts } from "../utils";
import styles from "./GanttAxis.module.css";

interface GanttAxisProps {
  range: AxisRange;
  width: number;
  today: string;
  showDays: boolean;
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
    <div className={styles.axis} style={{ width }}>
      {getWeekStarts(range).map((monday) => (
        <span
          key={monday}
          className={styles.week}
          style={{ left: x(monday), width: dayWidth * 7 }}
        >
          {formatDayLabel(monday)} – {formatDayLabel(addDays(monday, 6))}
        </span>
      ))}
      {showDays &&
        getAxisDays(range).map((date) => (
          <span
            key={date}
            className={styles.day}
            data-off={isWeekend(date) ? "true" : undefined}
            data-today={date === today ? "true" : undefined}
            style={{ left: x(date), width: dayWidth }}
          >
            {Number(date.slice(8))}
          </span>
        ))}
    </div>
  );
}
