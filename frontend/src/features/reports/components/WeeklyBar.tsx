import type { CSSProperties } from "react";
import type { WeeklyCompleted } from "../../../shared/types/reports";
import styles from "./WeeklyPanel.module.css";

interface WeeklyBarProps {
  item: WeeklyCompleted;
  index: number;
  maxCount?: number;
}

export default function WeeklyBar({
  item,
  index,
  maxCount = 6,
}: WeeklyBarProps) {
  const isNone = item.count === 0 && !item.current;
  const state = isNone ? "none" : item.current ? "now" : "done";
  const heightPercent = maxCount > 0 ? ((item.count || 0) / maxCount) * 100 : 0;
  const delay = (index * 0.07).toFixed(2);

  return (
    <div className={styles.col} data-state={state}>
      {!isNone ? <span className={styles.count}>{item.count}</span> : null}
      <span
        className={styles.bar}
        style={
          {
            "--h": `${heightPercent}%`,
            "--d": `${delay}s`,
          } as CSSProperties
        }
      />
    </div>
  );
}
