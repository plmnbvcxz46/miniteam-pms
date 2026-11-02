export type TimelineScale = "week" | "month";

const SCALES: { key: TimelineScale; label: string }[] = [
  { key: "week", label: "按周" },
  { key: "month", label: "按月" },
];

interface TimelineHeaderProps {
  kicker: string;
  scale: TimelineScale;
  onChangeScale: (scale: TimelineScale) => void;
  onCreateTask: () => void;
}

export default function TimelineHeader({
  kicker,
  scale,
  onChangeScale,
  onCreateTask,
}: TimelineHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">{kicker}</div>
        <h1 className="vt">
          时间<em>线</em>
        </h1>
      </div>
      <div className="va">
        <div className="seg" role="group" aria-label="刻度">
          {SCALES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === scale}
              onClick={() => onChangeScale(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="btn go" type="button" onClick={onCreateTask}>
          + 新建任务
        </button>
      </div>
    </div>
  );
}
