import React from "react";
import type { PermKey } from "../../../../types/global";
import type { Member, PermDef } from "../../../../types/members";
import { roleLabel } from "../../../../data/global";
import MemberLoad from "./MemberLoad";
import PermToggle from "./PermToggle";

interface MemberColumnProps {
  /** 成员信息 */
  member: Member;
  /** 权限行列表配置 */
  permDefs: PermDef[];
  /** 当前用户是否有权限管理成员权限 */
  canManageMember: boolean;
  /** 切换权限回调 */
  onTogglePerm: (key: PermKey) => void;
}

export default function MemberColumn({
  member,
  permDefs,
  canManageMember,
  onTogglePerm,
}: MemberColumnProps) {
  const isPm = member.projectRole === "PM";
  const roleName = member.position || roleLabel[member.projectRole];

  return (
    <React.Fragment>
      {/* 行 1：姓名卡（超出上限时增加 .hot 橙底高亮） */}
      <div className={`c-who ${member.overCapacity ? "hot" : ""}`}>
        <b>{member.user.realName}</b>
        <span>
          {roleName} <em>· {member.user.username}</em>
        </span>
      </div>

      {/* 行 2：本周工时大数与进度条 */}
      <MemberLoad
        weeklyHours={member.weeklyHours}
        weeklyCapacity={member.weeklyCapacity}
        overCapacity={member.overCapacity}
      />

      {/* 行 3：负责任务数 */}
      <div className="c-n">
        {member.taskCount} <small>项</small>
      </div>

      {/* 行 4-7：各项权限开关格 */}
      {permDefs.map((def, idx) => {
        const isLast = idx === permDefs.length - 1;
        const hasPerm = Boolean(member[def.key]);
        // PM 拥有全部权限不可取消；当前登录用户无管理权限时禁用
        const isDisabled = !canManageMember || isPm;

        return (
          <div key={def.key} className={`c-p ${isLast ? "last" : ""}`}>
            <PermToggle
              hasPerm={hasPerm}
              disabled={isDisabled}
              label={`${member.user.realName} ${def.label}`}
              onToggle={() => onTogglePerm(def.key)}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
}
