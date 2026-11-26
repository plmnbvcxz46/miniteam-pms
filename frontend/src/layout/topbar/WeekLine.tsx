import { Progress, type ProgressSegment } from "../../components/ui/Progress";
import type { ProjectPeriod } from "../../shared/types/global";
import { useIssue } from "../../stores/issue/useIssue";
import { getWeekProgress } from "../utils";
import styles from "./WeekLine.module.css";

export default function WeekLine({ period }: { period: ProjectPeriod }) {
  const { today } = useIssue();
  const { startLabel, endLabel, total, current } = getWeekProgress(
    period,
    today,
  );

  const segments: ProgressSegment[] = Array.from({ length: total }, (_, i) => ({
    key: `w-${i + 1}`,
    state:
      current === null
        ? "future"
        : i + 1 < current
          ? "past"
          : i + 1 === current
            ? "today"
            : "future",
  }));

  return (
    <div className={styles.weekline}>
      <span>{startLabel}</span>
      <Progress
        variant="segmented"
        segmentWidth={22}
        value={current ?? 0}
        max={total}
        segments={segments}
        aria-label={
          current
            ? `项目共 ${total} 周，当前第 ${current} 周`
            : `项目共 ${total} 周`
        }
      />
      <span>{endLabel}</span>
    </div>
  );
}
