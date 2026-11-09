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
  /** 看过去的期时不传，按钮不显示 */
  onExport?: () => void;
}

export default function ReportsHeader({
  summary,
  range,
  rangeOptions,
  onRangeChange,
  onExport,
}: ReportsHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="rp-kicker">
          {formatKicker(summary)}
        </div>
        <h1 className="vt t-page-title">
          统计<em>报表</em>
        </h1>
      </div>
      <div className="va">
        <div className="seg" role="group" aria-label="范围">
          {rangeOptions.map((opt) => {
            const isSelected = opt.value === range;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onRangeChange(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {onExport && (
          <button className="btn" type="button" onClick={onExport}>
            导出
          </button>
        )}
      </div>
    </div>
  );
}
