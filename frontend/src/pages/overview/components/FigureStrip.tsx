import type { OverviewStats } from "../../../shared/types/progress";
import { pad2 } from "../../../shared/utils/date";
import Figure from "./Figure";

interface FigureStripProps {
  stats: OverviewStats;
}

export default function FigureStrip({ stats }: FigureStripProps) {
  return (
    <div className="figures">
      <Figure label="DONE" value={pad2(stats.done)} unit={`/${stats.total}`} />
      <Figure label="REMAINING" value={pad2(stats.remaining)} />
      <Figure
        label="OVERDUE"
        value={pad2(stats.overdue)}
        alert={stats.overdue > 0}
      />
      <Figure label="DAYS LEFT" value={pad2(stats.remainingDays)} />
    </div>
  );
}
