interface FigureProps {
  label: string;
  value: number | string;
  /** 紧跟数字的弱化小字，如 DONE 的 /18 */
  unit?: string;
  /** 有风险时顶部加橙色条，数字变橙 */
  alert?: boolean;
}

export default function Figure({ label, value, unit, alert }: FigureProps) {
  return (
    <div className={alert ? "figure alert" : "figure"}>
      <div className="lbl">
        {label}
        <span className="chip">风险</span>
      </div>
      <div className="num">
        {value}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  );
}
