import type { WeeklyCompleted } from "../../../../types/reports";
import WeeklyBar from "./WeeklyBar";
import WeeklyAxis from "./WeeklyAxis";

interface WeeklyPanelProps {
  items: WeeklyCompleted[];
}

export default function WeeklyPanel({ items }: WeeklyPanelProps) {
  const maxCount = Math.max(1, ...items.map((i) => i.count)) + 1;

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k">// TASKS</span>
          <h2>完成任务</h2>
        </div>
        <span className="u">单位：项</span>
      </div>
      <div className="weekly" id="weekly">
        {items.map((item, idx) => (
          <WeeklyBar
            key={item.weekStart}
            item={item}
            index={idx}
            maxCount={maxCount}
          />
        ))}
      </div>
      <WeeklyAxis items={items} />
    </section>
  );
}
