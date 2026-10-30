export default function RolesPanel() {
  return (
    <section
      className="ss"
      id="ss-roles"
      data-sub="roles"
      data-g="系统"
      data-name="角色与权限"
    >
      <h2 className="ss-h">角色与权限</h2>
      <div className="scroll-x">
        <table className="tbl matrix" id="matrix">
          <thead>
            <tr>
              <th>菜单</th>
              <th>权限标识</th>
              <th className="p">超级管理员</th>
              <th className="p">项目经理</th>
              <th className="p">开发</th>
              <th className="p">测试</th>
              <th className="p">只读</th>
            </tr>
          </thead>
          <tbody />
        </table>
      </div>
    </section>
  );
}

