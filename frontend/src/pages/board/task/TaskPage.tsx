export default function TaskPage() {
  return (
    <section className="view" id="view-task" data-view="task">
      <div className="vh">
        <div className="vl">
          <div className="k">
            <button className="tk-back" type="button" id="tk-back">
              返回
            </button>
            <span className="tk-crumb" id="tk-crumb" />
          </div>
          <h1 className="vt" id="tk-title" />
          <p className="tk-meta" id="tk-meta" />
        </div>
        <div className="va tk-acts">
          <div
            className="chips"
            id="tk-status"
            role="group"
            aria-label="任务状态"
          />
          <button className="btn" type="button" id="tk-edit">
            编辑
          </button>
        </div>
      </div>

      <div className="figures" id="tk-figs" />

      <div className="tkg">
        {/* 时间 */}
        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 时间</span>
              <h2>排期与依赖</h2>
            </div>
            <span className="u">每格一天</span>
          </div>
          <div className="tt" id="tk-time" />
          <div className="scroll-y" id="tk-deps" />
        </section>

        {/* 说明 */}
        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 说明</span>
              <h2>任务说明</h2>
            </div>
          </div>
          <p className="tk-desc" id="tk-desc" />
          <div className="phd" style={{ marginTop: "16px" }}>
            <div>
              <span className="k">// 关联</span>
              <h2>文档与讨论</h2>
            </div>
          </div>
          <div id="tk-links" />
        </section>

        {/* 记录 */}
        <section className="pnl flat dark">
          <div className="phd">
            <div>
              <span className="k">// 记录</span>
              <h2>操作记录</h2>
            </div>
          </div>
          <div className="feed scroll-y" id="tk-log" />
        </section>
      </div>
    </section>
  );
}

