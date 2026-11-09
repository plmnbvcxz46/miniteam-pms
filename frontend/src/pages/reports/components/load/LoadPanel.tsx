import type { Workload } from "../../../../types/reports";
import { getLoadScale } from "../../../../utils/load";
import LoadRow from "./LoadRow";
import LoadAxis from "./LoadAxis";

interface LoadPanelProps {
  workload: Workload;
}

export default function LoadPanel({ workload }: LoadPanelProps) {
  const { members } = workload;
  const scale = getLoadScale(
    members.map((m) => m.weeklyHours),
    members.map((m) => m.capacity),
  );
  // 所有人上限相同时，横轴上标出上限；不同时每条自己的虚线各画各的
  const capacities = [...new Set(members.map((m) => m.capacity))];
  const sharedCapacity = capacities.length === 1 ? capacities[0] : null;

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k t-kicker">// WORKLOAD</span>
          <h2 className="t-section-title">成员工时</h2>
        </div>
        <span className="u">单位：小时（{sharedCapacity}）</span>
      </div>
      <div className="load" id="load">
        {members.map((member) => (
          <LoadRow key={member.user.id} member={member} maxScale={scale} />
        ))}
        <LoadAxis
          capacity={sharedCapacity}
          capPercent={
            sharedCapacity === null ? null : (sharedCapacity / scale) * 100
          }
        />
      </div>
    </section>
  );
}
