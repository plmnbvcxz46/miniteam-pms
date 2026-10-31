import type { WorkloadMember } from "../../../../types/reports";
import { calculateLoadBar } from "../../utils";

interface LoadRowProps {
  member: WorkloadMember;
  maxScale?: number;
}

export default function LoadRow({ member, maxScale = 50 }: LoadRowProps) {
  const {
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
        <span className="cap" />
      </div>
      <span className={`v${isOver ? " late" : ""}`}>{member.weeklyHours}</span>
    </div>
  );
}

