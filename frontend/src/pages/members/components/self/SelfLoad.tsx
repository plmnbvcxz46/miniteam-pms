import { calculateLoadBar, getLoadScale } from "../../../../shared/utils/load";

interface SelfLoadProps {
  hours: number;
  capacity: number;
}

export default function SelfLoad({ hours, capacity }: SelfLoadProps) {
  const scale = getLoadScale([hours], [capacity]);
  const { capPercent, fillPercent, overPercent, isOver } = calculateLoadBar(
    hours,
    capacity,
    scale,
  );

  return (
    <section
      className={`pnl me-load${isOver ? " over" : ""}`}
      aria-labelledby="me-load-h"
    >
      <div className="phd">
        <div>
          <span className="k t-kicker">// HOURS</span>
          <h2 className="t-section-title" id="me-load-h">本周工时</h2>
        </div>
        {isOver && <span className="chip">超出 {hours - capacity}</span>}
      </div>
      <div className="me-load-body">
        <div className="me-big">
          {hours}
          <small>（{capacity}）</small>
        </div>
        <div
          className="track"
          role="meter"
          aria-label="本周工时"
          aria-valuemin={0}
          aria-valuemax={scale}
          aria-valuenow={hours}
          aria-valuetext={`${hours} 小时，上限 ${capacity} 小时`}
        >
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
    </section>
  );
}
