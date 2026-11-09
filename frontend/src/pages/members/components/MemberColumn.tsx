import React from "react";
import type { PermKey, ProjectRole } from "../../../shared/types/global";
import type { Member, PermDef } from "../../../shared/types/members";
import { roleLabel } from "../../../shared/constants/labels";
import MemberLoad from "./MemberLoad";
import PermToggle from "./PermToggle";

interface MemberColumnProps {
  /** 成员信息 */
  member: Member;
  /** 一组成员共用的工时坐标轴最大值（小时） */
  loadScale: number;
  /** 权限行列表配置 */
  permDefs: PermDef[];
  /** 当前用户是否有权限管理成员权限 */
  canManageMember: boolean;
  /** 能不能改这个成员的项目角色，不能时只显示角色名 */
  canChangeRole: boolean;
  /** 切换权限回调 */
  onTogglePerm: (key: PermKey) => void;
  /** 修改项目角色回调 */
  onChangeRole: (role: ProjectRole) => void;
}

export default function MemberColumn({
  member,
  loadScale,
  permDefs,
  canManageMember,
  canChangeRole,
  onTogglePerm,
  onChangeRole,
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
        loadScale={loadScale}
        overCapacity={member.overCapacity}
      />

      {/* 行 3：负责任务数 */}
      <div className="c-n">
        {member.taskCount} <small>项</small>
      </div>

      {/* 行 4：本项目里的角色（项目经理、普通成员、测试人员），有权限的人可以改 */}
      <div className="c-p c-role">
        {canChangeRole ? (
          <select
            className="in"
            aria-label={`${member.user.realName} 在本项目里的角色`}
            value={member.projectRole}
            onChange={(e) => onChangeRole(e.target.value as ProjectRole)}
          >
            {(Object.keys(roleLabel) as ProjectRole[]).map((role) => (
              <option key={role} value={role}>
                {roleLabel[role]}
              </option>
            ))}
          </select>
        ) : (
          roleLabel[member.projectRole]
        )}
      </div>

      {/* 行 5-8：各项权限开关格 */}
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
