import type { CSSProperties } from "react";
import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import type { ScheduleRowData, WeekDay } from "../utils";
import styles from "./SchedulePanel.module.css";
import ScheduleRow from "./ScheduleRow";

const SCHEDULE_LEGENDS: readonly LegendItem[] = [
  { key: "on", label: "进行中", swatch: "solid" },
  { key: "next", label: "待开始", swatch: "outline" },
  { key: "stuck", label: "阻塞", swatch: "striped" },
];

interface SchedulePanelProps {
  week: WeekDay[];
  rows: ScheduleRowData[];
  /** 此刻是当天的几分之几，决定今天线在今天那一列里的位置 */
  dayProgress: number;
  onOpenTask: (taskId: number) => void;
}

export default function SchedulePanel({
  week,
  rows,
  dayProgress,
  onOpenTask,
}: SchedulePanelProps) {
  const todayIndex = week.findIndex((day) => day.today);

  return (
    <Panel
      variant="default"
      kicker="// WEEK"
      title="成员排期"
      className={styles.panel}
      headerRight={<Legend items={SCHEDULE_LEGENDS} />}
    >
      <div className={styles.scheduleScroll}>
        <div className={styles.schedule}>
          <div className={styles.daysHeader}>
            <span className={styles.gutter} />
            <div className={styles.dayCols}>
              {week.map((day) => (
                <span
                  key={day.date}
                  className={styles.dayCell}
                  data-today={day.today ? "true" : undefined}
                  data-weekend={!day.today && day.weekend ? "true" : undefined}
                >
                  {day.label}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.rowsWrap}>
            <div className={styles.rowsInner}>
              {todayIndex >= 0 && (
                <div
                  className={styles.todayLine}
                  aria-hidden="true"
                  style={{ "--at": todayIndex + dayProgress } as CSSProperties}
                />
              )}
              {rows.map((row) => (
                <ScheduleRow
                  key={row.user.id}
                  row={row}
                  now={todayIndex + dayProgress}
                  onOpen={onOpenTask}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
