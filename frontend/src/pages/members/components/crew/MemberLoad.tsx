import { calculateTrackWidth } from "../../utils";

interface MemberLoadProps {
  /** 本周工时 */
  weeklyHours: number;
  /** 每周工时上限（默认 40） */
  weeklyCapacity: number;
  /** 是否超出工时上限 */
  overCapacity?: boolean;
}

export default function MemberLoad({
  weeklyHours,
  weeklyCapacity,
  overCapacity,
}: MemberLoadProps) {
  const isOver = overCapacity ?? weeklyHours > weeklyCapacity;
  const { capPercent, fillPercent, overPercent } = calculateTrackWidth(
    weeklyHours,
    weeklyCapacity,
  );

  return (
    <div className="c-load">
      <div className={`big ${isOver ? "late" : ""}`}>{weeklyHours}</div>
      <div className="track">
        <div className="cap" />
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

