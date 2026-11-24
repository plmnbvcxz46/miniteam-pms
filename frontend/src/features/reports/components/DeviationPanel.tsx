import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import type { DurationDeviation } from "../../../shared/types/reports";
import styles from "./DeviationPanel.module.css";
import DeviationRow from "./DeviationRow";

const DEVIATION_LEGENDS: readonly LegendItem[] = [
  { key: "plan", label: "计划", swatch: "dashed" },
  { key: "actual", label: "实际", swatch: "solid" },
];

interface DeviationPanelProps {
  items: DurationDeviation[];
}

export default function DeviationPanel({ items }: DeviationPanelProps) {
  const maxDays = Math.max(
    8,
    ...items.map((i) => Math.max(i.planDays, i.actualDays)),
  );

  return (
    <Panel
      kicker="// DEVIATION"
      title="工期偏差"
      headerRight={<Legend items={DEVIATION_LEGENDS} />}
    >
      <div className={styles.list}>
        {items.map((item) => (
          <DeviationRow key={item.task.id} item={item} maxDays={maxDays} />
        ))}
      </div>
    </Panel>
  );
}
