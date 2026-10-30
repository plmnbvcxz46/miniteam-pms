export default function LogsPanel() {
  return (
    <section
      className="ss"
      id="ss-logs"
      data-sub="logs"
      data-g="系统"
      data-name="日志"
    >
      <h2 className="ss-h">日志</h2>
      <div className="logday">
        <h3>10 月 22 日 周四</h3>
        <div className="lg">
          <time>10:52</time>
          <span>普通员工 B</span>
          <p>任务 · 更新进度</p>
          <b>成功</b>
        </div>
        <div className="lg">
          <time>10:41</time>
          <span>普通员工 A</span>
          <p>协作 · 发表回复</p>
          <b>成功</b>
        </div>
        <div className="lg">
          <time>09:30</time>
          <span>测试经理 A</span>
          <p>任务 · 移动任务</p>
          <b>成功</b>
        </div>
        <div className="lg fail">
          <time>09:02</time>
          <span>guest</span>
          <p>登录 · 账号登录</p>
          <b>失败：账号已停用</b>
        </div>
      </div>
      <div className="logday">
        <h3>10 月 21 日 周三</h3>
        <div className="lg">
          <time>18:02</time>
          <span>普通员工 C</span>
          <p>文档 · 上传文档</p>
          <b>成功</b>
        </div>
        <div className="lg">
          <time>15:20</time>
          <span>测试经理 A</span>
          <p>任务 · 新建任务</p>
          <b>成功</b>
        </div>
        <div className="lg">
          <time>09:12</time>
          <span>普通员工 B</span>
          <p>文档 · 修订文档</p>
          <b>成功</b>
        </div>
      </div>
    </section>
  );
}

