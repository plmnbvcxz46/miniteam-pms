import { useState } from "react";
import { dictItems, dictTypes } from "../../../data/settings";

export default function DictPanel() {
  const [selected, setSelected] = useState(dictTypes[0].type);
  const current = dictTypes.find((t) => t.type === selected) ?? dictTypes[0];
  const items = dictItems
    .filter((item) => item.dictType === current.type)
    .sort((a, b) => a.sort - b.sort);

  return (
    <section className="ss" id="ss-dict">
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
              {dictTypes.map((type) => (
                <tr
                  key={type.type}
                  tabIndex={0}
                  aria-selected={type.type === current.type}
                  onClick={() => setSelected(type.type)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(type.type);
                    }
                  }}
                >
                  <td>{type.name}</td>
                  <td>
                    <code>{type.type}</code>
                  </td>
                  <td>
                    {dictItems.filter((i) => i.dictType === type.type).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="block span2 cl">
          <h2 id="dict-name">{current.name}</h2>
          <table className="tbl plain">
            <thead>
              <tr>
                <th>标签</th>
                <th>键值</th>
                <th>排序</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td>
                    <code>{item.value}</code>
                  </td>
                  <td>{item.sort}</td>
                  <td>{item.status === 1 ? "启用" : "停用"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
