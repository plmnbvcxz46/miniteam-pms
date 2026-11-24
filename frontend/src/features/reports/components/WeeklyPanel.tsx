import { Panel } from "../../../components/patterns/Panel";
import type { WeeklyCompleted } from "../../../shared/types/reports";
import WeeklyAxis from "./WeeklyAxis";
import WeeklyBar from "./WeeklyBar";
import styles from "./WeeklyPanel.module.css";

interface WeeklyPanelProps {
  items: WeeklyCompleted[];
}

export default function WeeklyPanel({ items }: WeeklyPanelProps) {
  const maxCount = Math.max(1, ...items.map((i) => i.count)) + 1;

  return (
    <Panel
      kicker="// TASKS"
      title="完成任务"
      headerRight={<span className={styles.unit}>单位：项</span>}
    >
      <div className={styles.weekly}>
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
    </Panel>
  );
}
