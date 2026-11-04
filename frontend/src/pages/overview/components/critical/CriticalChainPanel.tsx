import { Fragment } from "react";
import type { CriticalNode } from "../../../../types/progress";
import { formatDayLabel } from "../../../../utils/date";
import type { TimelineForecast } from "../../../timeline/utils";
import { isLate } from "../../utils";

interface CriticalChainPanelProps {
  chain: CriticalNode[];
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
        {chain.map((node, i) => {
          const hot = node.status !== "DONE" && node.overrunDays > 0;
          return (
            <Fragment key={node.taskId}>
              {i > 0 && "→"}
              {hot ? (
                <>
                  <span className="hot">
                    <b>{node.title}</b>
                    <i />
                  </span>
                  <em>+{node.overrunDays}</em>
                </>
              ) : (
                <span>{node.title}</span>
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
