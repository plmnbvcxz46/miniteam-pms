import React from "react";
import SearchDropdown from "../../../shared/components/SearchDropdown";
import { roleLabel } from "../../../shared/constants/labels";
import type { Member, PermDef } from "../../../shared/types/members";

interface CrewLabelsProps {
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 当前关键字匹配到的成员，作为下拉建议 */
  matches: Member[];
  /** 权限行定义配置列表 */
  permDefs: PermDef[];
  /** 每周工时上限的显示文字，如“40” */
  capacityText: string;
}

export default function CrewLabels({
  searchKeyword,
  onSearchChange,
  matches,
  permDefs,
  capacityText,
}: CrewLabelsProps) {
  return (
    <React.Fragment>
      {/* 行 1：搜索框 */}
      <div className="c-lb c-tools">
        <div className="field">
          <SearchDropdown
            variant="box"
            items={matches}
            getKey={(m) => m.user.id}
            onPick={(m) => onSearchChange(m.user.realName)}
            value={searchKeyword}
            onChange={onSearchChange}
            placeholder="姓名或账号"
            ariaLabel="按姓名或账号搜索成员"
            headWord="MEMBERS"
            emptyText="没有匹配的成员"
            // 这一格在横向滚动容器里，面板会被裁掉，所以按视口定位
            placement="fixed"
            minWidth={320}
            itemClassName={() => "sd-row"}
            renderItem={(m) => (
              <>
                <span>
                  <span className="sd-nm">{m.user.realName}</span>
                  <span className="sd-sub">{m.user.username}</span>
                </span>
                <span className="sd-end">{roleLabel[m.projectRole]}</span>
              </>
            )}
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
