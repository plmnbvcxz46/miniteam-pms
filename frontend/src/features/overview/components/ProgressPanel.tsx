import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import styles from "./ProgressPanel.module.css";

interface ProgressPanelProps {
  done: number;
  total: number;
}

export default function ProgressPanel({ done, total }: ProgressPanelProps) {
  const left = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const legendItems: LegendItem[] = [
    {
      key: "done",
      label: (
        <>
          已完成 <b className={styles.legendCount}>{done}</b>
        </>
      ),
      swatch: "solid",
    },
    {
      key: "left",
      label: (
        <>
          剩余 <b className={styles.legendCount}>{left}</b>
        </>
      ),
      swatch: "outline",
    },
  ];

  return (
    <Panel
      variant="default"
      kicker="// PROGRESS"
      title="项目进度"
      className={styles.panel}
      headerRight={<span className={styles.total}>共 {total} 项</span>}
    >
      <div className={styles.percent}>
        {percent}
        <em className={styles.percentMark}>%</em>
      </div>

      <div className={styles.bar} aria-hidden="true">
        <span
          className={`${styles.barPart} ${styles.barDone}`}
          style={{ width: `${percent}%` }}
        >
          {done || ""}
        </span>
        <span className={`${styles.barPart} ${styles.barLeft}`}>
          {left || ""}
        </span>
      </div>

      <Legend items={legendItems} className={styles.legendWrap} />
    </Panel>
  );
}
