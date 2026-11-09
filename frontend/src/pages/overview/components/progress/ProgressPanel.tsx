interface ProgressPanelProps {
  done: number;
  total: number;
}

export default function ProgressPanel({ done, total }: ProgressPanelProps) {
  const left = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="pnl pg">
      <div className="phd">
        <div>
          <span className="k t-kicker">// PROGRESS</span>
          <h2 className="t-section-title">项目进度</h2>
        </div>
        <span className="u">共 {total} 项</span>
      </div>
      <div className="big">
        {percent}
        <em>%</em>
      </div>
      <div className="pbar" aria-hidden="true">
        <span style={{ width: `${percent}%` }}>{done || ""}</span>
        <span>{left || ""}</span>
      </div>
      <div className="legend">
        <span>
          <i className="key on" />
          已完成 <b>{done}</b>
        </span>
        <span>
          <i className="key" />
          剩余 <b>{left}</b>
        </span>
      </div>
    </section>
  );
}
