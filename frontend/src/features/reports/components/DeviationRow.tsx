import type { CSSProperties } from "react";
import type { DurationDeviation } from "../../../shared/types/reports";
import styles from "./DeviationPanel.module.css";

interface DeviationRowProps {
  item: DurationDeviation;
  maxDays?: number;
}

export default function DeviationRow({
  item,
  maxDays = 12,
}: DeviationRowProps) {
  const DU = 0.09;
  const safeMax = Math.max(maxDays, 1);

  const planWidth = (item.planDays / safeMax) * 100;
  const baseActualDays =
    item.deviationDays > 0
      ? Math.max(0, item.actualDays - item.deviationDays)
      : item.actualDays;

  const actualWidth = (baseActualDays / safeMax) * 100;
  const overDays = Math.max(0, item.deviationDays);
  const overWidth = (overDays / safeMax) * 100;

  const isLate = item.deviationDays > 0;
  const devText = isLate
    ? `+${item.deviationDays}`
    : item.deviationDays < 0
      ? `${item.deviationDays}`
      : "0";

  return (
    <div className={styles.row}>
      <span className={styles.label} title={item.task.title}>
        {item.label}
      </span>
      <div className={styles.bars}>
        <span
          className={styles.bar}
          data-kind="plan"
          style={
            {
              width: `${planWidth}%`,
              "--dur": `${(item.planDays * DU).toFixed(2)}s`,
            } as CSSProperties
          }
        />
        <span
          className={styles.bar}
          data-kind="actual"
          style={
            {
              width: `${actualWidth}%`,
              "--dur": `${(baseActualDays * DU).toFixed(2)}s`,
            } as CSSProperties
          }
        />
        {overDays > 0 && (
          <span
            className={styles.bar}
            data-kind="over"
            style={
              {
                left: `${actualWidth}%`,
                width: `${overWidth}%`,
                "--d": `${(baseActualDays * DU).toFixed(2)}s`,
                "--dur": `${(overDays * DU).toFixed(2)}s`,
              } as CSSProperties
            }
          />
        )}
      </div>
      <span className={styles.value} data-late={isLate ? "true" : undefined}>
        {devText}
      </span>
    </div>
  );
}
