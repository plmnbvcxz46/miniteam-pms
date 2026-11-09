import type { CSSProperties } from "react";
import type { ScheduleRowData, WeekDay } from "../utils";
import ScheduleRow from "./ScheduleRow";

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
  // 今天线按此刻的时间画在今天那一列里，0 点在两列的分界线上
  const todayIndex = week.findIndex((day) => day.today);

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k t-kicker">// WEEK</span>
          <h2 className="t-section-title">成员排期</h2>
        </div>
        <div className="legend">
          <span>
            <i className="key on" />
            进行中
          </span>
          <span>
            <i className="key" />
            待开始
          </span>
          <span>
            <i className="key stuck" />
            阻塞
          </span>
        </div>
      </div>
      <div className="tl">
        <div className="days">
          <span className="gut" />
          <div className="cols">
            {week.map((day) => (
              <span
                key={day.date}
                className={day.today ? "on" : day.weekend ? "we" : undefined}
              >
                {day.label}
              </span>
            ))}
          </div>
        </div>
        <div className="rows">
          {todayIndex >= 0 && (
            <div
              className="today"
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
    </section>
  );
}
