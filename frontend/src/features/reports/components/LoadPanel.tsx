import { Panel } from "../../../components/patterns/Panel";
import type { Workload } from "../../../shared/types/reports";
import { getLoadScale } from "../../../shared/utils/load";
import LoadAxis from "./LoadAxis";
import styles from "./LoadPanel.module.css";
import LoadRow from "./LoadRow";

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
  const unitText =
    sharedCapacity !== null ? `单位：小时（${sharedCapacity}）` : "单位：小时";

  return (
    <Panel
      kicker="// WORKLOAD"
      title="成员工时"
      headerRight={<span className={styles.unit}>{unitText}</span>}
    >
      <div className={styles.load}>
        {members.map((member) => (
          <LoadRow key={member.user.id} member={member} maxScale={scale} />
        ))}
        <LoadAxis
          capacity={sharedCapacity}
          capPercent={sharedCapacity === null ? null : (sharedCapacity / scale) * 100}
        />
      </div>
    </Panel>
  );
}
