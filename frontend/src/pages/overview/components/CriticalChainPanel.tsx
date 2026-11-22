import type { CriticalNode } from "../../../shared/types/progress";
import { formatDayLabel } from "../../../shared/utils/date";
import type { TimelineForecast } from "../../timeline/utils";
import { isLate } from "../utils";

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
  // 当前节点是第一个没完成的；全部完成时落在最后一个
  const firstTodo = chain.findIndex((node) => node.status !== "DONE");
  const current = firstTodo < 0 ? chain.length - 1 : firstTodo;
  // 只显示当前节点和它的下一个节点
  const shown = chain
    .map((node, i) => ({ node, i }))
    .slice(current, current + 2);
  const isHot = (node: CriticalNode) =>
    node.status !== "DONE" && node.overrunDays > 0;
  const nodeNo = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <section className="pnl dark cp">
      <div className="phd">
        <div>
          <span className="k t-kicker">// CHAIN</span>
          <h2 className="t-section-title">关键路径</h2>
        </div>
        <span
          className="chip"
          style={{ background: "var(--paper)", color: "var(--ink)" }}
        >
          总工期 {totalDays} 天
        </span>
      </div>
      <div className="chain">
        <div className="cells">
          {chain.map((node, i) => (
            <span
              key={node.taskId}
              className={[
                i < current ? "done" : i === current ? "now" : "",
                isHot(node) ? "hot" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={`${nodeNo(i)} ${node.title}${isHot(node) ? `（逾期 ${node.overrunDays} 天）` : ""}`}
            />
          ))}
        </div>
        {shown.map(({ node, i }, k) => (
          <div
            key={node.taskId}
            className={k === 0 ? "step" : "step next"}
            title={node.title}
          >
            <b>{nodeNo(i)}</b>
            <span>{node.title}</span>
            {isHot(node) && <em>+{node.overrunDays}</em>}
          </div>
        ))}
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
