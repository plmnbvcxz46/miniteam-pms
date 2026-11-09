interface LoadAxisProps {
  /** 上限虚线所在的百分比位置，成员上限不一致时不标 */
  capPercent: number | null;
  /** 上限小时数，和 capPercent 同时有或没有 */
  capacity: number | null;
}

export default function LoadAxis({ capPercent, capacity }: LoadAxisProps) {
  return (
    <div className="axisrow">
      <span />
      <span>
        <i style={{ left: 0 }}>0</i>
        {capPercent !== null && capacity !== null && (
          <i style={{ left: `${capPercent}%` }}>{capacity}</i>
        )}
      </span>
      <span />
    </div>
  );
}
