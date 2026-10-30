export default function BoardPage() {
  return (
    <section className="view" id="view-board" data-view="board">
      <div className="vh">
        <div className="vl">
          <div className="k" id="bd-kicker">
            共 11 项 · 1 项阻塞 · 4 项在关键路径
          </div>
          <h1 className="vt">
            任务<em>看板</em>
          </h1>
        </div>
        <div className="va">
          <div className="seg" id="bd-filter" role="group" aria-label="筛选">
            <button type="button" data-f="all" aria-pressed="true">
              全部
            </button>
            <button type="button" data-f="mine" aria-pressed="false">
              我的
            </button>
            <button type="button" data-f="crit" aria-pressed="false">
              关键路径
            </button>
          </div>
          <button className="btn go" type="button" data-form="task">
            + 新建任务
          </button>
        </div>
      </div>

      <div className="scroll-x">
        <div className="board" id="board">
          {/* TODO 列 */}
          <div className="col todo">
            <header>
              <div>
                <span className="k">// TODO</span>
                <h3>待开始</h3>
              </div>
              <span className="count">0</span>
            </header>
            <button className="addcard" type="button" data-form="task">
              新建任务
            </button>
            <div className="drop">
              <article className="card" id="t148">
                <div className="top">
                  <span className="tag">T-148</span>
                  <span className="score p-h" title="优先级得分 72">
                    高<small>72</small>
                  </span>
                </div>
                <span className="title">按钮权限指令</span>
                <div className="meta">
                  <span>测试经理 A</span>
                  <span>10.27</span>
                </div>
              </article>
              <article className="card crit" id="t144">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                  <span className="score p-m" title="优先级得分 68">
                    中<small>68</small>
                  </span>
                </div>
                <span className="title">菜单接口</span>
                <div className="meta">
                  <span>普通员工 A</span>
                  <span>10.28</span>
                </div>
              </article>
              <article className="card" id="t146">
                <div className="top">
                  <span className="tag">T-146</span>
                  <span className="score p-l" title="优先级得分 31">
                    低<small>31</small>
                  </span>
                </div>
                <span className="title">周会纪要</span>
                <div className="meta">
                  <span>普通员工 C</span>
                  <span>10.22</span>
                </div>
              </article>
              <article className="card" id="t150">
                <div className="top">
                  <span className="tag">T-150</span>
                  <span className="score p-l" title="优先级得分 24">
                    低<small>24</small>
                  </span>
                </div>
                <span className="title">部署脚本</span>
                <div className="meta">
                  <span>未分配</span>
                  <span>11.02</span>
                </div>
              </article>
            </div>
          </div>

          {/* DOING 列 */}
          <div className="col doing">
            <header>
              <div>
                <span className="k">// DOING</span>
                <h3>进行中</h3>
              </div>
              <span className="count">0</span>
            </header>
            <div className="drop">
              <article className="card crit" id="t142">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                  <span className="score p-h" title="优先级得分 86">
                    高<small>86</small>
                  </span>
                </div>
                <span className="title">权限模块联调</span>
                <i className="prog" aria-hidden="true">
                  <b style={{ width: "70%" }} />
                </i>
                <div className="meta">
                  <span>测试经理 A</span>
                  <span className="now">今天</span>
                </div>
              </article>
              <article className="card crit" id="t137">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                  <span className="score p-h" title="优先级得分 74">
                    高<small>74</small>
                  </span>
                </div>
                <span className="title">甘特图组件</span>
                <i className="prog" aria-hidden="true">
                  <b style={{ width: "60%" }} />
                </i>
                <div className="meta">
                  <span>普通员工 B</span>
                  <span>10.23</span>
                </div>
              </article>
              <article className="card" id="t135">
                <div className="top">
                  <span className="tag">T-135</span>
                  <span className="score p-m" title="优先级得分 55">
                    中<small>55</small>
                  </span>
                </div>
                <span className="title">答辩 PPT 第二版</span>
                <i className="prog" aria-hidden="true">
                  <b style={{ width: "35%" }} />
                </i>
                <div className="meta">
                  <span>普通员工 C</span>
                  <span>10.24</span>
                </div>
              </article>
            </div>
          </div>

          {/* BLOCKED 列 */}
          <div className="col blocked">
            <header>
              <div>
                <span className="k">// BLOCKED</span>
                <h3>阻塞</h3>
              </div>
              <span className="count">0</span>
            </header>
            <div className="drop">
              <article className="card crit" id="t139">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                  <span className="score p-h" title="优先级得分 91">
                    高<small>91</small>
                  </span>
                </div>
                <span className="title">补全接口文档</span>
                <div className="meta">
                  <span>普通员工 A</span>
                  <span className="late">逾期 2 天</span>
                </div>
              </article>
            </div>
            <div className="bby" id="blocked-by" />
          </div>

          {/* DONE 列 */}
          <div className="col done">
            <header>
              <div>
                <span className="k">// DONE</span>
                <h3>已完成</h3>
              </div>
              <span className="count">0</span>
            </header>
            <div className="drop">
              <article className="card crit" id="t131">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                </div>
                <span className="title">数据库表设计</span>
                <div className="meta">
                  <span>普通员工 B</span>
                  <span>10.17</span>
                </div>
              </article>
              <article className="card crit" id="t129">
                <div className="top">
                  <span className="tag crit">■ 关键路径</span>
                </div>
                <span className="title">需求分析</span>
                <div className="meta">
                  <span>测试经理 A</span>
                  <span>10.16</span>
                </div>
              </article>
              <article className="card" id="t128">
                <div className="top">
                  <span className="tag">T-128</span>
                </div>
                <span className="title">登录接口</span>
                <div className="meta">
                  <span>普通员工 A</span>
                  <span>10.18</span>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

