export default function ReportsPage() {
  return (
    <section className="view" id="view-reports" data-view="reports">
      <div className="vh">
        <div className="vl">
          <div className="k" id="rp-kicker">
            第 05/10 周 · 已完成 18 / 42 项 · 剩余 24 项
          </div>
          <h1 className="vt">
            统计<em>报表</em>
          </h1>
        </div>
        <div className="va">
          <div className="seg" role="group" aria-label="范围">
            <button type="button" aria-pressed="true">
              本周
            </button>
            <button type="button" aria-pressed="false">
              全周期
            </button>
          </div>
          <button className="btn" type="button">
            导出
          </button>
        </div>
      </div>

      <div className="rpt">
        <section className="pnl span2">
          <div className="phd">
            <div>
              <span className="k">// 燃尽 · 全项目</span>
              <h2>剩余任务</h2>
            </div>
            <div className="legend">
              <span>
                <i className="key on" style={{ height: "3px" }} />
                实际
              </span>
              <span>
                <i
                  className="key dash"
                  style={{ height: 0, borderWidth: "1.5px 0 0" }}
                />
                计划
              </span>
              <span>
                <i
                  className="key"
                  style={{
                    height: 0,
                    borderWidth: "3px 0 0",
                    borderColor: "var(--signal)",
                    borderStyle: "dashed",
                  }}
                />
                预测
              </span>
            </div>
          </div>
          <div className="chartbox">
            <svg
              id="burn"
              className="chart"
              viewBox="0 0 815 262"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="燃尽图：实际进度落后计划，预测 12 月 1 日完成，计划 11 月 27 日"
            />
          </div>
        </section>

        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 本周</span>
              <h2>成员工时</h2>
            </div>
            <span className="u">单位：小时 · 虚线为上限 40</span>
          </div>
          <div className="load" id="load" />
        </section>

        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 每周</span>
              <h2>完成任务</h2>
            </div>
            <span className="u">单位：项</span>
          </div>
          <div className="weekly" id="weekly" />
        </section>

        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 计划 vs 实际</span>
              <h2>工期偏差</h2>
            </div>
            <div className="legend">
              <span>
                <i className="key dash" />
                计划
              </span>
              <span>
                <i className="key on" />
                实际
              </span>
            </div>
          </div>
          <div className="dev" id="dev" />
        </section>

        <section className="hero" id="rp-hero">
          <div className="hk">
            <span>// 全项目预测完工</span>
            <span className="chip">风险</span>
          </div>
          <span className="huge" id="rp-n">
            12.1
          </span>
          <div className="hsub" id="rp-sub">
            计划 11.27 · 晚 4 天
            <br />
            按当前燃尽速度推算，剩余 24 项
          </div>
        </section>
      </div>
    </section>
  );
}
