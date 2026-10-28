export default function MembersPage() {
  return (
    <section className="view" id="view-members" data-view="members">
      <div className="vh">
        <div className="vl">
          <div className="k" id="mb-kicker">
            4 名成员 · 本周 1 人超出工时上限
          </div>
          <h1 className="vt">
            成员<em>权限</em>
          </h1>
        </div>
        <div className="va">
          <button className="btn go" type="button" data-form="member">
            + 邀请成员
          </button>
        </div>
      </div>

      <div className="scroll-x" style={{ flexShrink: 0 }}>
        <div className="crew" id="crew" />
      </div>

      <section className="plogw">
        <div>
          <span className="k">// 变更记录</span>
          <b>权限变更</b>
        </div>
        <div className="plog" id="perm-log">
          <div className="hv">
            <b>10.21</b>
            <span>测试经理 A 授予 普通员工 B 编辑文档</span>
          </div>
          <div className="hv">
            <b>10.15</b>
            <span>测试经理 A 收回 普通员工 C 调整排期</span>
          </div>
          <div className="hv">
            <b>9.22</b>
            <span>测试经理 A 邀请 普通员工 C 加入项目</span>
          </div>
          <div className="hv">
            <b>9.21</b>
            <span>测试经理 A 创建项目</span>
          </div>
        </div>
      </section>
    </section>
  );
}

