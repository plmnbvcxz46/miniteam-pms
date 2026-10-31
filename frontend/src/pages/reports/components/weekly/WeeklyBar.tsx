import type { WeeklyCompleted } from "../../../../types/reports";

interface WeeklyBarProps {
  item: WeeklyCompleted;
  index: number;
  maxCount?: number;
}

export default function WeeklyBar({
  item,
  index,
  maxCount = 7,
}: WeeklyBarProps) {
  const isNone = item.count === 0 && !item.current;
  const cls = isNone ? "none" : item.current ? "now" : "done";
  const heightPercent = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0;
  const delay = (index * 0.07).toFixed(2);

  return (
    <div className="wk">
      {item.count > 0 ? <span>{item.count}</span> : null}
      <span
        className={`bar ${cls}`}
        style={
          {
            "--h": `${heightPercent}%`,
            "--d": `${delay}s`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

