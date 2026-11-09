import type { ProjectPeriod } from "../../shared/types/global";
import { useIssue } from "../../state/issue/useIssue";
import { getWeekProgress } from "../utils";

export default function WeekLine({ period }: { period: ProjectPeriod }) {
  const { today } = useIssue();
  const { startLabel, endLabel, total, current } = getWeekProgress(
    period,
    today,
  );
  return (
    <div className="weekline">
      <span>{startLabel}</span>
      <div
        className="weeks"
        style={{ gridTemplateColumns: `repeat(${total}, 22px)` }}
        aria-label={
          current
            ? `项目共 ${total} 周，当前第 ${current} 周`
            : `项目共 ${total} 周`
        }
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              current === null
                ? undefined
                : i + 1 < current
                  ? "past"
                  : i + 1 === current
                    ? "now"
                    : undefined
            }
          />
        ))}
      </div>
      <span>{endLabel}</span>
    </div>
  );
}
