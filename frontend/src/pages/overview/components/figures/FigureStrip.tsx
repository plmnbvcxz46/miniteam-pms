import type { OverviewStats } from "../../utils";
import { pad2 } from "../../utils";
import { formatDayLabel } from "../../../../utils/date";
import Figure from "./Figure";

interface FigureStripProps {
  stats: OverviewStats;
  /** 项目计划结束日 yyyy-MM-dd */
  planEnd: string;
}

export default function FigureStrip({ stats, planEnd }: FigureStripProps) {
  const worst = stats.overdue[0];
  return (
    <div className="figures">
      <Figure label="已完成" value={stats.done} sub={`共 ${stats.total} 项`} />
      <Figure
        label="剩余任务"
        value={stats.left}
        sub={`关键路径 ${stats.criticalLeft} 项`}
      />
      <Figure
        label="逾期"
        value={pad2(stats.overdue.length)}
        sub={worst ? `${worst.title} · ${worst.overdueDays} 天` : "无逾期"}
        alert={worst !== undefined}
      />
      <Figure
        label="剩余天数"
        value={stats.daysLeft}
        sub={`截止 ${formatDayLabel(planEnd)}`}
      />
    </div>
  );
}
