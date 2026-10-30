export default function MePanels() {
  return (
    <section
      className="ss"
      id="ss-me"
      data-sub="me"
      data-g="我的"
      data-name="个人"
    >
      <h2 className="ss-h">个人</h2>
      <div className="blk">
        <h2>身份</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-name">姓名</label>
            <div>
              <input className="in" id="s-name" defaultValue="测试经理 A" />
            </div>
          </div>
          <div className="srow">
            <span className="lb">账号</span>
            <div>
              <code>pm_a</code>
            </div>
          </div>
          <div className="srow">
            <span className="lb">密码</span>
            <div>
              <button className="btn" type="button">
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="blk">
        <h2>偏好</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-proj">默认打开</label>
            <div>
              <select className="in" id="s-proj" defaultValue="测试项目 App">
                <option>测试项目 App</option>
                <option>测试项目 Web</option>
              </select>
            </div>
          </div>
          <div className="srow">
            <span className="lb">消息提醒</span>
            <div>
              <span className="sw2" role="group" aria-label="消息提醒">
                <button type="button" aria-pressed="true">
                  开
                </button>
                <button type="button" aria-pressed="false">
                  关
                </button>
              </span>
            </div>
          </div>
          <div className="srow">
            <span className="lb">减少动态效果</span>
            <div>
              <span
                className="sw2"
                role="group"
                aria-label="减少动态效果"
                id="sw-calm"
              >
                <button type="button" aria-pressed="false">
                  开
                </button>
                <button type="button" aria-pressed="true">
                  关
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

