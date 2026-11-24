import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/ToggleGroup";
import type {
  BurndownRange,
  RangeOption,
  ReportSummary,
} from "../../../shared/types/reports";
import { formatKicker } from "../utils";

interface ReportsHeaderProps {
  summary: ReportSummary;
  range: BurndownRange;
  rangeOptions: RangeOption[];
  onRangeChange: (range: BurndownRange) => void;
  exporting?: boolean;
  /** 看过去的期时不传，按钮不显示 */
  onExport?: () => void;
}

export default function ReportsHeader({
  summary,
  range,
  rangeOptions,
  onRangeChange,
  exporting = false,
  onExport,
}: ReportsHeaderProps) {
  return (
    <PageHeader
      kicker={formatKicker(summary)}
      title="统计"
      accentTitle="报表"
      actions={
        <>
          <ToggleGroup
            type="single"
            variant="segmented"
            aria-label="范围"
            value={range}
            onValueChange={(next) => {
              if (next) onRangeChange(next as BurndownRange);
            }}
          >
            {rangeOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {onExport && (
            <Button variant="default" loading={exporting} onClick={onExport}>
              导出
            </Button>
          )}
        </>
      }
    />
  );
}
