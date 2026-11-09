import type { WorkloadMember } from "../../../../shared/types/reports";
import { calculateLoadBar } from "../../../../shared/utils/load";

interface LoadRowProps {
  member: WorkloadMember;
  /** 一组成员共用的坐标轴最大值（小时） */
  maxScale: number;
}

export default function LoadRow({ member, maxScale }: LoadRowProps) {
  const {
    capPercent,
    fillPercent,
    fillDur,
    overPercent,
    overLeftPercent,
    overDelay,
    overDur,
    isOver,
  } = calculateLoadBar(member.weeklyHours, member.capacity, maxScale);

  return (
    <div className="lrow">
      <b>{member.user.realName}</b>
      <div className="track">
        <span
          className="fill"
          style={
            {
              width: `${fillPercent}%`,
              "--dur": `${fillDur}s`,
            } as React.CSSProperties
          }
        />
        {isOver && (
          <span
            className="over"
            style={
              {
                left: `${overLeftPercent}%`,
                width: `${overPercent}%`,
                "--d2": `${overDelay}s`,
                "--dur2": `${overDur}s`,
              } as React.CSSProperties
            }
          />
        )}
        <span className="cap" style={{ left: `${capPercent}%` }} />
      </div>
      <span className={`v${isOver ? " late" : ""}`}>{member.weeklyHours}</span>
    </div>
  );
}
