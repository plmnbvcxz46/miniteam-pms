import {
  MetricStrip,
  type MetricStripItem,
} from "../../../components/patterns/MetricStrip";
import { Badge } from "../../../components/ui/Badge";
import type { OverviewStats } from "../../../shared/types/progress";
import { pad2 } from "../../../shared/utils/date";

interface FigureStripProps {
  stats: OverviewStats;
}

export default function FigureStrip({ stats }: FigureStripProps) {
  const items: MetricStripItem[] = [
    {
      key: "done",
      label: "DONE",
      value: pad2(stats.done),
      unit: `/${stats.total}`,
    },
    {
      key: "remaining",
      label: "REMAINING",
      value: pad2(stats.remaining),
    },
    {
      key: "overdue",
      label: "OVERDUE",
      value: pad2(stats.overdue),
      tone: stats.overdue > 0 ? "alert" : "default",
      badge:
        stats.overdue > 0 ? (
          <Badge variant="solid" size="sm">
            风险
          </Badge>
        ) : undefined,
    },
    {
      key: "daysLeft",
      label: "DAYS LEFT",
      value: pad2(stats.remainingDays),
    },
  ];

  return <MetricStrip items={items} />;
}
