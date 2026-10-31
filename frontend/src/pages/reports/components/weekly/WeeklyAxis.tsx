import type { WeeklyCompleted } from "../../../../types/reports";
import { toMonthDay } from "../../utils";

interface WeeklyAxisProps {
  items: WeeklyCompleted[];
}

export default function WeeklyAxis({ items }: WeeklyAxisProps) {
  return (
    <div className="wk-ax">
      {items.map((item) => (
        <span key={item.weekStart}>{toMonthDay(item.weekStart)}</span>
      ))}
    </div>
  );
}

