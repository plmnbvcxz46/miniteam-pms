import type { OverviewStats } from "../../../shared/types/progress";
import type { TaskDetail } from "../../../shared/types/task";
import { pad2 } from "../../../shared/utils/date";
import { formatDayLabel } from "../../../shared/utils/date";
import Figure from "./Figure";

interface FigureStripProps {
  stats: OverviewStats;
  /** 逾期最久的任务，没有逾期为空 */
  worst: TaskDetail | null;
}

export default function FigureStrip({ stats, worst }: FigureStripProps) {
  return (
    <div className="figures">
      <Figure label="DONE" value={stats.done} sub={`共 ${stats.total} 项`} />
      <Figure
        label="REMAINING"
        value={stats.remaining}
        sub={`关键路径 ${stats.criticalRemaining} 项`}
      />
      <Figure
        label="OVERDUE"
        value={pad2(stats.overdue)}
        sub={
          worst
            ? `${worst.title} · ${worst.overdueDays} 天`
            : stats.overdue > 0
              ? "有逾期任务"
              : "无逾期"
        }
        alert={stats.overdue > 0}
      />
      <Figure
        label="DAYS LEFT"
        value={stats.remainingDays}
        sub={`截止 ${formatDayLabel(stats.planEnd)}`}
      />
    </div>
  );
}
