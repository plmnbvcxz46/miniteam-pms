import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type { TimelineScale } from "../hooks/useTimelinePage";
import styles from "./TimelineHeader.module.css";

const SCALES: { key: TimelineScale; label: string }[] = [
  { key: "week", label: "按周" },
  { key: "month", label: "按月" },
];

interface TimelineHeaderProps {
  kicker: string;
  scale: TimelineScale;
  onChangeScale: (scale: TimelineScale) => void;
  onCreateTask?: () => void;
}

export default function TimelineHeader({
  kicker,
  scale,
  onChangeScale,
  onCreateTask,
}: TimelineHeaderProps) {
  return (
    <PageHeader
      kicker={kicker}
      title="时间"
      accentTitle="线"
      actions={
        <div className={styles.actions}>
          <ToggleGroup
            type="single"
            variant="segmented"
            aria-label="刻度"
            value={scale}
            onValueChange={(next) => {
              if (next) onChangeScale(next as TimelineScale);
            }}
          >
            {SCALES.map((item) => (
              <ToggleGroupItem key={item.key} value={item.key}>
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {onCreateTask && (
            <Button variant="accent" onClick={onCreateTask}>
              + 新建任务
            </Button>
          )}
        </div>
      }
    />
  );
}
