export default function DictPanel() {
  return (
    <section
      className="ss"
      id="ss-dict"
      data-sub="dict"
      data-g="系统"
      data-name="字典"
    >
      <h2 className="ss-h">字典</h2>
      <div className="g4">
        <div className="block span2">
          <h2>字典类型</h2>
          <table className="tbl plain pick" id="dict-types">
            <thead>
              <tr>
                <th>字典名称</th>
                <th>字典类型</th>
                <th>数据项</th>
              </tr>
            </thead>
            <tbody>
              <tr data-k="task_status" aria-selected="true">
                <td>任务状态</td>
                <td>
                  <code>task_status</code>
                </td>
                <td>4</td>
              </tr>
              <tr data-k="task_priority">
                <td>任务优先级</td>
                <td>
                  <code>task_priority</code>
                </td>
                <td>3</td>
              </tr>
              <tr data-k="doc_status">
                <td>文档状态</td>
                <td>
                  <code>doc_status</code>
                </td>
                <td>3</td>
              </tr>
              <tr data-k="project_role">
                <td>项目角色</td>
                <td>
                  <code>project_role</code>
                </td>
                <td>4</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="block span2 cl">
          <h2 id="dict-name">任务状态</h2>
          <table className="tbl plain">
            <thead>
              <tr>
                <th>标签</th>
                <th>键值</th>
                <th>排序</th>
                <th>样式</th>
              </tr>
            </thead>
            <tbody id="dict-data" />
          </table>
        </div>
      </div>
    </section>
  );
}

