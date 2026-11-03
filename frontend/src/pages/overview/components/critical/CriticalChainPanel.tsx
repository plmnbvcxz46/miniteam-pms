import { Fragment } from "react";
import type { TaskDetail } from "../../../../types/task";
import { formatDayLabel } from "../../../../utils/date";
import type { TimelineForecast } from "../../../timeline/utils";
import { isLate } from "../../utils";

interface CriticalChainPanelProps {
  chain: TaskDetail[];
  forecast: TimelineForecast;
  /** 总工期（工作日） */
  totalDays: number;
}

export default function CriticalChainPanel({
  chain,
  forecast,
  totalDays,
}: CriticalChainPanelProps) {
  return (
    <section className="pnl dark cp">
      <div className="phd">
        <div>
          <span className="k">// CHAIN</span>
          <h2>关键路径</h2>
        </div>
        <span
          className="chip"
          style={{ background: "var(--paper)", color: "var(--ink)" }}
        >
          总工期 {totalDays} 天
        </span>
      </div>
      <div className="chain">
        {chain.map((task, i) => {
          const hot = task.status !== "DONE" && task.overdueDays > 0;
          return (
            <Fragment key={task.id}>
              {i > 0 && "→"}
              {hot ? (
                <>
                  <span className="hot">
                    <b>{task.title}</b>
                    <i />
                  </span>
                  <em>+{task.overdueDays}</em>
                </>
              ) : (
                <span>{task.title}</span>
              )}
            </Fragment>
          );
        })}
      </div>
      <div className="foot">
        <span>
          计划 {formatDayLabel(forecast.planEnd)}
          <br />
          预测
        </span>
        <b className={isLate(forecast) ? "" : "ok"}>
          {formatDayLabel(forecast.predictedEnd)}
        </b>
      </div>
    </section>
  );
}
