import type { DurationDeviation } from "../../../../types/reports";

interface DeviationRowProps {
  item: DurationDeviation;
  maxDays?: number;
}

export default function DeviationRow({
  item,
  maxDays = 12,
}: DeviationRowProps) {
  const DU = 0.09;
  const safeMax = Math.max(maxDays, 1);

  // 计划宽度与基准天数
  const planWidth = (item.planDays / safeMax) * 100;
  const baseActualDays =
    item.deviationDays > 0
      ? Math.max(0, item.actualDays - item.deviationDays)
      : item.actualDays;

  const actualWidth = (baseActualDays / safeMax) * 100;
  const overDays = Math.max(0, item.deviationDays);
  const overWidth = (overDays / safeMax) * 100;

  const isLate = item.deviationDays > 0;
  const devText = isLate
    ? `+${item.deviationDays}`
    : item.deviationDays < 0
      ? `${item.deviationDays}`
      : "0";

  return (
    <div className="drow">
      <span title={item.task.title}>{item.label}</span>
      <div className="dbars">
        {/* 计划虚线条 */}
        <span
          className="p"
          style={
            {
              width: `${planWidth}%`,
              "--dur": `${(item.planDays * DU).toFixed(2)}s`,
            } as React.CSSProperties
          }
        />
        {/* 实际实线条 */}
        <span
          className="a"
          style={
            {
              width: `${actualWidth}%`,
              "--dur": `${(baseActualDays * DU).toFixed(2)}s`,
            } as React.CSSProperties
          }
        />
        {/* 延期超期段 */}
        {overDays > 0 && (
          <span
            className="o"
            style={
              {
                left: `${actualWidth}%`,
                width: `${overWidth}%`,
                "--d": `${(baseActualDays * DU).toFixed(2)}s`,
                "--dur": `${(overDays * DU).toFixed(2)}s`,
              } as React.CSSProperties
            }
          />
        )}
      </div>
      <span className={`v${isLate ? " late" : ""}`}>{devText}</span>
    </div>
  );
}

