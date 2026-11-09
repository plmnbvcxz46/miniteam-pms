import { calculateLoadBar } from "../../../../shared/utils/load";

interface MemberLoadProps {
  /** 本周工时 */
  weeklyHours: number;
  /** 每周工时上限 */
  weeklyCapacity: number;
  /** 一组成员共用的坐标轴最大值（小时） */
  loadScale: number;
  /** 是否超出工时上限 */
  overCapacity?: boolean;
}

export default function MemberLoad({
  weeklyHours,
  weeklyCapacity,
  loadScale,
  overCapacity,
}: MemberLoadProps) {
  const isOver = overCapacity ?? weeklyHours > weeklyCapacity;
  const { capPercent, fillPercent, overPercent } = calculateLoadBar(
    weeklyHours,
    weeklyCapacity,
    loadScale,
  );

  return (
    <div className="c-load">
      <div className={`big ${isOver ? "late" : ""}`}>{weeklyHours}</div>
      <div className="track">
        <div className="cap" style={{ left: `${capPercent}%` }} />
        <div className="fill" style={{ width: `${fillPercent}%` }} />
        {overPercent > 0 && (
          <div
            className="over"
            style={{ left: `${capPercent}%`, width: `${overPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}
