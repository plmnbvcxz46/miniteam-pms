import type { Burndown } from "../../../../shared/types/reports";
import BurndownChart from "./BurndownChart";

interface BurndownPanelProps {
  burndown: Burndown;
}

export default function BurndownPanel({ burndown }: BurndownPanelProps) {
  return (
    <section className="pnl span2">
      <div className="phd">
        <div>
          <span className="k t-kicker">// BURNDOWN</span>
          <h2 className="t-section-title">剩余任务</h2>
        </div>
        <div className="legend">
          <span>
            <i className="key on" style={{ height: "3px" }} />
            实际
          </span>
          <span>
            <i
              className="key dash"
              style={{ height: 0, borderWidth: "1.5px 0 0" }}
            />
            计划
          </span>
          <span>
            <i
              className="key"
              style={{
                height: 0,
                borderWidth: "3px 0 0",
                borderColor: "var(--signal)",
                borderStyle: "dashed",
              }}
            />
            预测
          </span>
        </div>
      </div>
      <div className="chartbox">
        <BurndownChart burndown={burndown} />
      </div>
    </section>
  );
}
