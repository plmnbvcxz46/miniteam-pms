interface NoAccessProps {
  onBack: () => void;
}

/** 没有权限查看这个任务时，替代任务详情显示 */
export default function NoAccess({ onBack }: NoAccessProps) {
  return (
    <section className="view" id="view-task" data-view="task">
      <div className="vh">
        <div className="vl">
          <div className="k">[ 任务详情 ]</div>
          <h1 className="vt t-page-title">
            无权<em>查看</em>
          </h1>
        </div>
        <div className="va">
          <button className="btn" type="button" onClick={onBack}>
            ← 返回
          </button>
        </div>
      </div>
      <section className="pnl">
        <p>这个任务不是你负责的，也不在关键路径上，看不了详情。</p>
      </section>
    </section>
  );
}
