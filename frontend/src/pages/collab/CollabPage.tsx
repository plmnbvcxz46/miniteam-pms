export default function CollabPage() {
  return (
    <section className="view" id="view-team" data-view="team">
      <div className="vh">
        <div className="vl">
          <div className="k" id="tm-kicker">
            5 个讨论 · 今天 3 条动态 · 1 个关联逾期
          </div>
          <h1 className="vt">
            团队<em>协作</em>
          </h1>
        </div>
      </div>

      <div className="tg">
        {/* 全部讨论 */}
        <section className="pnl flat">
          <div className="phd">
            <div>
              <span className="k">// 讨论</span>
              <h2>全部讨论</h2>
            </div>
            <span className="n" id="th-count">
              5
            </span>
          </div>
          <div className="threads scroll-y" id="threads" />
        </section>

        {/* 讨论内容 */}
        <section className="pnl flat" id="thread">
          <div className="phd">
            <div>
              <span className="k">// 讨论内容</span>
              <h2 id="th-title">接口文档字段命名统一</h2>
            </div>
          </div>
          <div className="th-meta" id="th-meta" />
          <div className="msgs scroll-y" id="msgs" />
          <form className="reply" id="reply">
            <label className="sr" htmlFor="reply-text">
              回复
            </label>
            <textarea
              id="reply-text"
              rows={2}
              placeholder="写回复，@ 可提及成员"
            />
            <button className="btn primary" type="submit">
              发送
            </button>
          </form>
        </section>

        {/* 项目动态 */}
        <section className="pnl flat dark">
          <div className="phd">
            <div>
              <span className="k">// 项目动态</span>
              <h2>动态</h2>
            </div>
            <span className="n" id="fd-count">
              06
            </span>
          </div>
          <div className="feed scroll-y" id="feed">
            <div className="ev">
              <time>10:52</time>
              <p>
                普通员工 B 把 <b>甘特图组件</b> 的进度更新为 60%
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

