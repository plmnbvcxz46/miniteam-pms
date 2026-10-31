import React from "react";
import type { PermDef } from "../../../../types/members";

interface CrewLabelsProps {
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 权限行定义配置列表 */
  permDefs: PermDef[];
}

export default function CrewLabels({
  searchKeyword,
  onSearchChange,
  permDefs,
}: CrewLabelsProps) {
  return (
    <React.Fragment>
      {/* 行 1：搜索框 */}
      <div className="c-lb c-tools">
        <div className="field">
          <input
            type="search"
            placeholder="姓名或账号"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="按姓名或账号搜索成员"
          />
        </div>
      </div>

      {/* 行 2：本周工时 */}
      <div className="c-lb">
        <b>本周工时</b>
        <small>单位：小时，虚线为上限 40</small>
      </div>

      {/* 行 3：负责任务 */}
      <div className="c-lb">
        <b>负责任务</b>
      </div>

      {/* 行 4-7：权限项说明 */}
      {permDefs.map((def) => (
        <div key={def.key} className="c-lb">
          <b>{def.label}</b>
          <small>{def.desc}</small>
        </div>
      ))}
    </React.Fragment>
  );
}
