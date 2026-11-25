import type { CSSProperties } from "react";
import { WEEK_DAYS, type ScheduleRowData } from "../utils";
import styles from "./ScheduleRow.module.css";

const BAR_HEIGHT = 26;
const BAR_GAP = 4;

interface ScheduleRowProps {
  row: ScheduleRowData;
  /** 此刻离本周一 0 点几天（含小数），和今天线同一个位置 */
  now: number;
  onOpen: (taskId: number) => void;
}

export default function ScheduleRow({ row, now, onOpen }: ScheduleRowProps) {
  const laneHeight = row.lanes * BAR_HEIGHT + (row.lanes - 1) * BAR_GAP;
  const at = (now / WEEK_DAYS) * 100;

  return (
    <div className={styles.row}>
      <span className={styles.who}>{row.user.realName}</span>
      <div className={styles.lane} style={{ height: laneHeight }}>
        {row.bars.map((bar) => {
          const fill =
            bar.tone === "next"
              ? 0
              : Math.min(100, Math.max(0, ((at - bar.left) / bar.width) * 100));
          return (
            <button
              key={bar.taskId}
              className={styles.bar}
              data-tone={bar.tone}
              type="button"
              title={bar.title}
              style={
                {
                  left: `${bar.left}%`,
                  width: `${bar.width}%`,
                  top: bar.lane * (BAR_HEIGHT + BAR_GAP),
                  height: BAR_HEIGHT,
                  "--fill": fill / 100,
                } as CSSProperties
              }
              onClick={() => onOpen(bar.taskId)}
            >
              <span className={styles.barLabel}>{bar.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
