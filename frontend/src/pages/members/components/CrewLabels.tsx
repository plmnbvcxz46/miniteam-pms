import React from "react";
import type { PermDef } from "../../../shared/types/members";

interface CrewLabelsProps {
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 权限行定义配置列表 */
  permDefs: PermDef[];
  /** 每周工时上限的显示文字，如“40” */
  capacityText: string;
}

export default function CrewLabels({
  searchKeyword,
  onSearchChange,
  permDefs,
  capacityText,
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
        <small>
          单位：小时{capacityText && ` · ${capacityText}/周`}
        </small>
      </div>

      {/* 行 3：负责任务 */}
      <div className="c-lb">
        <b>负责任务</b>
      </div>

      {/* 行 4：项目角色 */}
      <div className="c-lb">
        <b>项目角色</b>
      </div>

      {/* 行 5-8：权限项说明 */}
      {permDefs.map((def) => (
        <div key={def.key} className="c-lb">
          <b>{def.label}</b>
          <small>{def.desc}</small>
        </div>
      ))}
    </React.Fragment>
  );
}
