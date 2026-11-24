import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import type { Burndown } from "../../../shared/types/reports";
import BurndownChart from "./BurndownChart";

const BURNDOWN_LEGENDS: readonly LegendItem[] = [
  { key: "actual", label: "实际", swatch: "line-solid" },
  { key: "plan", label: "计划", swatch: "line-dashed" },
  { key: "pred", label: "预测", swatch: "line-accent-dashed" },
];

interface BurndownPanelProps {
  burndown: Burndown;
  className?: string;
}

export default function BurndownPanel({
  burndown,
  className,
}: BurndownPanelProps) {
  return (
    <Panel
      kicker="// BURNDOWN"
      title="剩余任务"
      headerRight={<Legend items={BURNDOWN_LEGENDS} />}
      className={className}
    >
      <BurndownChart burndown={burndown} />
    </Panel>
  );
}
