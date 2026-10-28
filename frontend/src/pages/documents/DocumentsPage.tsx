export default function DocumentsPage() {
  return (
    <section className="view" id="view-docs" data-view="docs">
      <div className="vh">
        <div className="vl">
          <div className="k" id="dc-kicker">
            修订中 3 份 · 定稿 4 份 · 1 份逾期
          </div>
          <h1 className="vt">
            项目<em>文档</em>
          </h1>
        </div>
        <div className="va toolbar">
          <label className="field" htmlFor="dq">
            文档名称
            <input id="dq" type="search" placeholder="输入后回车" />
          </label>
          <button className="btn primary go" type="button">
            + 上传文档
          </button>
        </div>
      </div>

      <div className="dg">
        <div className="dleft">
          <section className="dsec on">
            <header className="dsec-h">
              <div>
                <span className="k">// REVISING</span>
                <h3>修订中</h3>
              </div>
              <div className="legend">
                <span>
                  <i className="key on" />
                  已进行
                </span>
                <span>
                  <i className="key over" />
                  逾期
                </span>
                <span>
                  <i
                    className="key dash"
                    style={{
                      width: 0,
                      height: "12px",
                      borderWidth: "0 0 0 1.5px",
                    }}
                  />
                  截止日
                </span>
                <span>
                  <i
                    className="key"
                    style={{
                      width: 0,
                      height: "12px",
                      borderWidth: "0 0 0 1.5px",
                      borderColor: "var(--signal)",
                    }}
                  />
                  今天
                </span>
              </div>
              <span className="count" id="dc-on">
                0
              </span>
            </header>
            <div className="scroll-x">
              <div className="dx">
                <div className="dx-head">
                  <span />
                  <div className="dx-axis" id="dx-axis" />
                  <span />
                  <span />
                </div>
                <div
                  className="dx-rows"
                  id="docs"
                  role="listbox"
                  aria-label="修订中的文档"
                />
              </div>
            </div>
          </section>

          <section className="dsec fin">
            <header className="dsec-h">
              <div>
                <span className="k">// FINAL</span>
                <h3>定稿</h3>
              </div>
              <span className="count" id="dc-fin">
                0
              </span>
            </header>
            <div
              className="dfin"
              id="docs-fin"
              role="listbox"
              aria-label="已定稿的文档"
            />
          </section>
        </div>

        <section className="pnl dside">
          <div className="dhero" id="doc-hero">
            <div className="hk">
              <h2 id="doc-title">接口文档</h2>
              <span className="chip">风险</span>
            </div>
            <div className="row">
              <b id="dh-n">02</b>
              <span id="dh-sub">
                天 逾期
                <br />
                截止 10.20
              </span>
            </div>
          </div>
          <dl className="facts" id="doc-facts" />
          <div className="hhead">
            <b>版本记录</b>
            <span
              className="u mono"
              style={{ fontSize: "10px", color: "var(--mute)" }}
              id="doc-hn"
            />
          </div>
          <div className="hist scroll-y" id="doc-hist" />
          <div className="up">
            <button className="btn primary" type="button" data-form="doc">
              上传新版本 <span aria-hidden="true">↑</span>
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

