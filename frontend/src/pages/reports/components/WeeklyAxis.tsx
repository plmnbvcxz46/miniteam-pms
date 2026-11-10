import type { WeeklyCompleted } from "../../../shared/types/reports";
import { formatDayLabel } from "../../../shared/utils/date";

interface WeeklyAxisProps {
  items: WeeklyCompleted[];
}

export default function WeeklyAxis({ items }: WeeklyAxisProps) {
  return (
    <div className="wk-ax">
      {items.map((item) => (
        <span key={item.weekStart}>{formatDayLabel(item.weekStart)}</span>
      ))}
    </div>
  );
}
