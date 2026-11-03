interface FigureProps {
  label: string;
  value: number | string;
  sub: string;
  /** 有风险时顶部加橙色条，数字变橙 */
  alert?: boolean;
}

export default function Figure({ label, value, sub, alert }: FigureProps) {
  return (
    <div className={alert ? "figure alert" : "figure"}>
      <div className="lbl">
        {label}
        <span className="chip">风险</span>
      </div>
      <div className="num">{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
