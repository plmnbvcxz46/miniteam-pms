import type { DurationDeviation } from "../../../../types/reports";
import DeviationRow from "./DeviationRow";

interface DeviationPanelProps {
  items: DurationDeviation[];
}

export default function DeviationPanel({ items }: DeviationPanelProps) {
  const maxDays = Math.max(
    8,
    ...items.map((i) => Math.max(i.planDays, i.actualDays)),
  );

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k">// 计划 vs 实际</span>
          <h2>工期偏差</h2>
        </div>
        <div className="legend">
          <span>
            <i className="key dash" />
            计划
          </span>
          <span>
            <i className="key on" />
            实际
          </span>
        </div>
      </div>
      <div className="dev" id="dev">
        {items.map((item) => (
          <DeviationRow key={item.task.id} item={item} maxDays={maxDays} />
        ))}
      </div>
    </section>
  );
}
