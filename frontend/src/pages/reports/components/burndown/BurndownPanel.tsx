import type { Burndown, BurndownRange } from "../../../../types/reports";
import BurndownChart from "./BurndownChart";

interface BurndownPanelProps {
  burndown: Burndown;
  range: BurndownRange;
}

export default function BurndownPanel({ burndown, range }: BurndownPanelProps) {
  const rangeTitle = range === "week" ? "本周" : "全周期";

  return (
    <section className="pnl span2">
      <div className="phd">
        <div>
          <span className="k">// 燃尽 · {rangeTitle}</span>
          <h2>剩余任务</h2>
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
        <BurndownChart burndown={burndown} range={range} />
      </div>
    </section>
  );
}
