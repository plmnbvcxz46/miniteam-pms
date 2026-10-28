export default function ParamsPanel() {
  return (
    <section
      className="ss"
      id="ss-params"
      data-sub="params"
      data-g="系统"
      data-name="系统参数"
    >
      <h2 className="ss-h">系统参数</h2>
      <div className="blk">
        <h2>账号安全</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">新用户默认密码</span>
            <div className="inl">
              <code>••••••••</code>
              <button className="btn" type="button">
                重新设置
              </button>
            </div>
          </div>
          <div className="srow">
            <span className="lb">允许自助注册</span>
            <div>
              <span className="sw2" role="group" aria-label="允许自助注册">
                <button type="button" aria-pressed="false">
                  开
                </button>
                <button type="button" aria-pressed="true">
                  关
                </button>
              </span>
            </div>
          </div>
          <div className="srow">
            <label htmlFor="s-lock">登录失败锁定</label>
            <div className="inl">
              <input className="in xs" id="s-lock" defaultValue="5" />
              <span>次</span>
            </div>
          </div>
          <div className="srow">
            <label htmlFor="s-sess">会话超时</label>
            <div className="inl">
              <input className="in xs" id="s-sess" defaultValue="120" />
              <span>分钟</span>
            </div>
          </div>
        </div>
      </div>
      <div className="blk">
        <h2>版面</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-hl">头条字数上限</label>
            <div className="inl">
              <input className="in xs" id="s-hl" defaultValue="24" />
              <span>字</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

