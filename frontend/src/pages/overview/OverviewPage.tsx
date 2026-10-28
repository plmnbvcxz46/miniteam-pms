export default function OverviewPage() {
  return (
    <section className="view" id="view-overview" data-view="overview">
      <div className="vh">
        <div className="vl">
          <div className="k" id="ov-kicker">
            第 32 期 · 2026.10.22 周四 · 第 05/10 周
          </div>
          <h1 className="vt">
            项目<em>日报</em>
          </h1>
          <div className="vd" id="ov-deck">
            计划 · 追踪 · 交付 — 今天 18 项已完成，24 项待推进，1 项逾期。
          </div>
        </div>
        <div className="va">
          <button className="btn open-issues" type="button">
            往期 ▾
          </button>
          <button className="btn go" type="button" data-form="task">
            + 新建任务
          </button>
        </div>
      </div>

      <div className="figures">
        <div className="figure">
          <div className="lbl">已完成</div>
          <div className="num" id="f-done">
            18
          </div>
          <div className="sub" id="f-done-s">
            共 42 项
          </div>
        </div>
        <div className="figure">
          <div className="lbl">剩余任务</div>
          <div className="num" id="f-left">
            24
          </div>
          <div className="sub">4 项在关键路径上</div>
        </div>
        <div className="figure" id="f-late-box">
          <div className="lbl">
            逾期<span className="chip">风险</span>
          </div>
          <div className="num" id="f-late">
            01
          </div>
          <div className="sub" id="f-late-s">
            补全接口文档 · 2 天
          </div>
        </div>
        <div className="figure">
          <div className="lbl">剩余天数</div>
          <div className="num" id="f-days">
            38
          </div>
          <div className="sub">截止 11.29</div>
        </div>
      </div>

      <div className="ov1">
        <section className="pnl">
          <div className="phd">
            <div>
              <span className="k">// 本周</span>
              <h2>成员排期</h2>
            </div>
            <div className="legend">
              <span>
                <i className="key on" />
                进行中
              </span>
              <span>
                <i className="key" />
                待开始
              </span>
              <span>
                <i className="key stuck" />
                阻塞
              </span>
            </div>
          </div>
          <div className="tl">
            <div className="days">
              <span className="gut" />
              <div className="cols" id="tl-days">
                <span>19</span>
                <span>20</span>
                <span>21</span>
                <span className="on">22</span>
                <span>23</span>
                <span className="we">24</span>
                <span className="we">25</span>
              </div>
            </div>
            <div className="rows">
              <div className="today" id="tl-today" aria-hidden="true" />
              <div className="row">
                <span className="who">测试经理 A</span>
                <div className="lane">
                  <div className="bar on" style={{ left: "14.3%", width: "41.4%" }}>
                    权限模块联调
                  </div>
                  <div className="bar next" style={{ left: "60%", width: "26%" }}>
                    按钮权限
                  </div>
                </div>
              </div>
              <div className="row">
                <span className="who">普通员工 A</span>
                <div className="lane">
                  <div className="bar stuck" style={{ left: 0, width: "24%" }}>
                    <span>接口文档</span>
                  </div>
                  <div className="bar next" style={{ left: "40%", width: "46%" }}>
                    菜单接口
                  </div>
                </div>
              </div>
              <div className="row">
                <span className="who">普通员工 B</span>
                <div className="lane">
                  <div className="bar on" style={{ left: "30%", width: "56%" }}>
                    甘特图组件
                  </div>
                </div>
              </div>
              <div className="row">
                <span className="who">普通员工 C</span>
                <div className="lane">
                  <div className="bar on" style={{ left: "14.3%", width: "41.4%" }}>
                    答辩 PPT
                  </div>
                  <div className="bar next" style={{ left: "70%", width: "16%" }}>
                    彩排
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hero" id="ov-hero">
          <div className="hk">
            <span>// 今日头条</span>
            <span className="chip">风险</span>
          </div>
          <p className="headline" id="ov-headline">
            <span>接口文档逾期两天，</span>
            <span>两项任务因此受阻</span>
          </p>
          <div className="big">
            <b id="hero-n">+02</b>
            <span id="hero-sub">
              天 · 预测完成
              <br />
              10.28 → 10.30
            </span>
          </div>
          <div className="tags" id="hero-tags">
            <span data-t="t144">菜单接口</span>
            <span data-t="t148">按钮权限</span>
          </div>
          <a className="go" id="hero-go" data-t="t139">
            查看受阻任务 <span aria-hidden="true">→</span>
          </a>
        </section>
      </div>

      <div className="ov2">
        <section className="pnl todo-list">
          <div className="phd">
            <div>
              <span className="k">// 今日</span>
              <h2 id="todo-title">今日待办</h2>
            </div>
            <span className="n" id="todo-n">
              04
            </span>
          </div>
          <div id="todo" />
        </section>

        <section className="pnl pg">
          <div className="phd">
            <div>
              <span className="k">// 整体</span>
              <h2>项目进度</h2>
            </div>
            <span className="u">共 42 项</span>
          </div>
          <div className="big" id="pg-n">
            43<em>%</em>
          </div>
          <div className="pbar" aria-hidden="true">
            <span id="pg-a" style={{ width: "43%" }}>
              18
            </span>
            <span id="pg-b">24</span>
          </div>
          <div className="legend">
            <span>
              <i className="key on" />
              已完成 <b id="pg-la">18</b>
            </span>
            <span>
              <i className="key" />
              剩余 <b id="pg-lb">24</b>
            </span>
          </div>
        </section>

        <section className="pnl dark cp">
          <div className="phd">
            <div>
              <span className="k">// 依赖计算</span>
              <h2>关键路径</h2>
            </div>
            <span
              className="chip"
              style={{ background: "var(--paper)", color: "var(--ink)" }}
            >
              总时差 0
            </span>
          </div>
          <div className="chain">
            <span>A 需求</span>→<span>B 数据库</span>→
            <span className="hot">
              <b>C 后端</b>
              <i id="cp-over" />
            </span>
            <em id="cp-over-n">+2</em>→<span>E 联调</span>
          </div>
          <div className="foot">
            <span id="cp-l">
              计划 10.28
              <br />
              预测
            </span>
            <b id="cp-date">10.30</b>
          </div>
        </section>
      </div>
    </section>
  );
}
