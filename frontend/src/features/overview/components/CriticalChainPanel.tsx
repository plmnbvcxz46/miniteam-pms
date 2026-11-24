import { Panel } from "../../../components/patterns/Panel";
import type { CriticalNode } from "../../../shared/types/progress";
import { formatDayLabel } from "../../../shared/utils/date";
import type { TimelineForecast } from "../../../shared/utils/forecast";
import { isLate } from "../utils";
import styles from "./CriticalChainPanel.module.css";

interface CriticalChainPanelProps {
  chain: CriticalNode[];
  forecast: TimelineForecast;
  totalDays: number;
}

export default function CriticalChainPanel({
  chain,
  forecast,
  totalDays,
}: CriticalChainPanelProps) {
  const firstTodo = chain.findIndex((node) => node.status !== "DONE");
  const current = firstTodo < 0 ? chain.length - 1 : firstTodo;
  const shown = chain
    .map((node, i) => ({ node, i }))
    .slice(current, current + 2);
  const isHot = (node: CriticalNode) =>
    node.status !== "DONE" && node.overrunDays > 0;
  const nodeNo = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <Panel
      variant="dark"
      kicker="// CHAIN"
      title="关键路径"
      className={styles.panel}
      headerRight={
        <span className={styles.totalChip}>总工期 {totalDays} 天</span>
      }
    >
      <div className={styles.chain}>
        <div className={styles.cells}>
          {chain.map((node, i) => {
            const state = i < current ? "done" : i === current ? "now" : undefined;
            return (
              <span
                key={node.taskId}
                className={styles.cell}
                data-state={state}
                data-hot={isHot(node) ? "true" : undefined}
                title={`${nodeNo(i)} ${node.title}${isHot(node) ? `（逾期 ${node.overrunDays} 天）` : ""}`}
              />
            );
          })}
        </div>
        {shown.map(({ node, i }, k) => (
          <div
            key={node.taskId}
            className={styles.step}
            data-next={k > 0 ? "true" : undefined}
            title={node.title}
          >
            <b className={styles.stepNo}>{nodeNo(i)}</b>
            <span className={styles.stepTitle}>{node.title}</span>
            {isHot(node) && (
              <em className={styles.stepOverrun}>+{node.overrunDays}</em>
            )}
          </div>
        ))}
      </div>

      <div className={styles.foot}>
        <span className={styles.footLabel}>
          计划 {formatDayLabel(forecast.planEnd)}
          <br />
          预测
        </span>
        <b
          className={styles.footDate}
          data-late={isLate(forecast) ? "true" : undefined}
        >
          {formatDayLabel(forecast.predictedEnd)}
        </b>
      </div>
    </Panel>
  );
}
