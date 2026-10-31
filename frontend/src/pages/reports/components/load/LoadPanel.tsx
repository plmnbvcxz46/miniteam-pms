import type { Workload } from "../../../../types/reports";
import LoadRow from "./LoadRow";
import LoadAxis from "./LoadAxis";

interface LoadPanelProps {
  workload: Workload;
}

export default function LoadPanel({ workload }: LoadPanelProps) {
  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k">// 本周</span>
          <h2>成员工时</h2>
        </div>
        <span className="u">单位：小时 · 虚线为上限 40</span>
      </div>
      <div className="load" id="load">
        {workload.members.map((member) => (
          <LoadRow key={member.user.id} member={member} />
        ))}
        <LoadAxis />
      </div>
    </section>
  );
}
