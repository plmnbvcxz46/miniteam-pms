export default function ProgressPage() {
  return (
    <section className="view" id="view-gantt" data-view="gantt">
      <div className="vh">
        <div className="vl">
          <div className="k">
            5 项任务 · 4 项在关键路径 · 总工期 13 个工作日
          </div>
          <h1 className="vt">
            进度<em>甘特</em>
          </h1>
        </div>
        <div className="va">
          <div className="seg" role="group" aria-label="刻度">
            <button type="button" aria-pressed="true">
              按周
            </button>
            <button type="button" aria-pressed="false">
              按月
            </button>
          </div>
          <button className="btn go" type="button" data-form="task">
            + 新建任务
          </button>
        </div>
      </div>

      <section className="pnl gp">
        <div className="phd">
          <div>
            <span className="k">// 依赖排期 · 本阶段</span>
            <h2>关键路径甘特图</h2>
          </div>
          <div className="r">
            <div className="legend">
              <span>
                <i className="key on" />
                关键路径
              </span>
              <span>
                <i className="key" />
                非关键
              </span>
              <span>
                <i className="key dash" />
                总时差
              </span>
              <span>
                <i className="key over" />
                预计超期
              </span>
            </div>
            <div className="pred">
              <span id="gp-l">
                本阶段预测
                <br />
                计划 10.28 · 晚 2 天
              </span>
              <b id="gp-d">10.30</b>
            </div>
          </div>
        </div>

        <div className="scroll-x">
          <div className="gantt">
            <div className="g-head">
              <span className="gut" />
              <div className="cols">
                <span className="wk" style={{ gridColumn: "1 / span 5" }}>
                  10.12 – 10.16
                </span>
                <span className="wk" style={{ gridColumn: "6 / span 5" }}>
                  10.19 – 10.23
                </span>
                <span className="wk" style={{ gridColumn: "11 / span 5" }}>
                  10.26 – 10.30
                </span>
                <span className="wk" style={{ gridColumn: "16 / span 1" }}>
                  11 月
                </span>
                <span className="d">12</span>
                <span className="d">13</span>
                <span className="d">14</span>
                <span className="d">15</span>
                <span className="d">16</span>
                <span className="d">19</span>
                <span className="d">20</span>
                <span className="d">21</span>
                <span className="d today">22</span>
                <span className="d">23</span>
                <span className="d">26</span>
                <span className="d">27</span>
                <span className="d">28</span>
                <span className="d">29</span>
                <span className="d">30</span>
                <span className="d">2</span>
              </div>
            </div>

            <div className="g-body">
              <div className="g-row">
                <div className="name">
                  <b>A 需求分析</b>
                  <small>测试经理 A · 3 天</small>
                </div>
                <div className="lane">
                  <span
                    className="g-bar crit"
                    data-id="A"
                    style={
                      {
                        gridColumn: "1 / 4",
                        "--d": "0s",
                        "--dur": "0.22s",
                      } as React.CSSProperties
                    }
                  >
                    已完成
                  </span>
                </div>
              </div>

              <div className="g-row">
                <div className="name">
                  <b>B 数据库设计</b>
                  <small>普通员工 B · 2 天</small>
                </div>
                <div className="lane">
                  <span
                    className="g-bar crit"
                    data-id="B"
                    style={
                      {
                        gridColumn: "4 / 6",
                        "--d": "0.38s",
                        "--dur": "0.18s",
                      } as React.CSSProperties
                    }
                  >
                    已完成
                  </span>
                </div>
              </div>

              <div className="g-row">
                <div className="name">
                  <b>C 后端开发</b>
                  <small>普通员工 A · 5 天</small>
                </div>
                <div className="lane">
                  <span
                    className="g-bar crit"
                    data-id="C"
                    style={
                      {
                        gridColumn: "6 / 11",
                        "--d": "0.72s",
                        "--dur": "0.35s",
                      } as React.CSSProperties
                    }
                  >
                    进行中
                  </span>
                  <span
                    className="g-bar over"
                    data-id="Cend"
                    style={
                      {
                        gridColumn: "11 / 13",
                        "--d": "1.05s",
                        "--dur": "0.18s",
                      } as React.CSSProperties
                    }
                    title="预计多用 2 天"
                  />
                </div>
              </div>

              <div className="g-row">
                <div className="name">
                  <b>D 前端开发</b>
                  <small>测试经理 A · 4 天</small>
                </div>
                <div className="lane">
                  <span
                    className="g-bar free"
                    data-id="D"
                    style={
                      {
                        gridColumn: "4 / 8",
                        "--d": "1.83s",
                        "--dur": "0.28s",
                      } as React.CSSProperties
                    }
                  >
                    进行中
                  </span>
                  <span
                    className="g-bar slack"
                    data-id="Dend"
                    style={
                      {
                        gridColumn: "8 / 11",
                        "--d": "2.09s",
                        "--dur": "0.22s",
                      } as React.CSSProperties
                    }
                    title="总时差 3 天"
                  />
                </div>
              </div>

              <div className="g-row last">
                <div className="name">
                  <b>E 联调测试</b>
                  <small>普通员工 C · 3 天</small>
                </div>
                <div className="lane">
                  <span
                    className="g-bar ghost"
                    id="g-ghost"
                    style={
                      {
                        gridColumn: "11 / 14",
                        "--d": "1.05s",
                        "--dur": "0.22s",
                      } as React.CSSProperties
                    }
                  >
                    原计划
                  </span>
                  <span
                    className="g-bar crit"
                    data-id="E"
                    style={
                      {
                        gridColumn: "13 / 16",
                        "--d": "1.38s",
                        "--dur": "0.22s",
                      } as React.CSSProperties
                    }
                  >
                    预测
                  </span>
                </div>
              </div>

              <svg className="deps" id="deps" aria-hidden="true" />

              <div
                className="g-line today"
                id="gl-today"
                data-at="8.5"
                style={{
                  left: "calc(var(--name) + (100% - var(--name)) * 8.5 / 16)",
                }}
              >
                <span className="g-flag">今天</span>
              </div>

              <div
                className="g-line plan"
                id="gl-plan"
                data-at="13"
                style={{
                  left: "calc(var(--name) + (100% - var(--name)) * 13 / 16)",
                }}
              >
                <span className="g-flag left">计划 10.28</span>
              </div>

              <div
                className="g-line pred"
                id="gl-pred"
                data-at="15"
                style={{
                  left: "calc(var(--name) + (100% - var(--name)) * 15 / 16)",
                }}
              >
                <span className="g-flag left" style={{ color: "var(--signal-text)" }}>
                  预测 10.30
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pnl cpmp">
        <div className="phd">
          <div>
            <span className="k">// CPM · 单位：工作日</span>
            <h2>关键路径计算</h2>
          </div>
          <span className="u" id="cpm-sum">
            关键路径 A → B → C → E　·　总工期 13　·　C 预计超期
            <em>+2</em>
          </span>
        </div>

        <div className="scroll-x">
          <table className="tbl cpm">
            <thead>
              <tr>
                <th>任务</th>
                <th>工期</th>
                <th>最早开始</th>
                <th>最早完成</th>
                <th>最迟开始</th>
                <th>最迟完成</th>
                <th>总时差</th>
              </tr>
            </thead>
            <tbody>
              <tr className="crit">
                <td>A 需求分析</td>
                <td>3</td>
                <td>0</td>
                <td>3</td>
                <td>0</td>
                <td>3</td>
                <td>0</td>
              </tr>
              <tr className="crit">
                <td>B 数据库设计</td>
                <td>2</td>
                <td>3</td>
                <td>5</td>
                <td>3</td>
                <td>5</td>
                <td>0</td>
              </tr>
              <tr className="crit">
                <td>C 后端开发</td>
                <td>5</td>
                <td>5</td>
                <td>10</td>
                <td>5</td>
                <td>10</td>
                <td>0</td>
              </tr>
              <tr>
                <td>D 前端开发</td>
                <td>4</td>
                <td>3</td>
                <td>7</td>
                <td>6</td>
                <td>10</td>
                <td>3</td>
              </tr>
              <tr className="crit">
                <td>E 联调测试</td>
                <td>3</td>
                <td>10</td>
                <td>13</td>
                <td>10</td>
                <td>13</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
