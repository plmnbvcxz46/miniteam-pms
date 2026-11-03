import type { MemberPermissions } from "../types/global";
import type { Account } from "../types/auth";
import { members } from "./members";
import { roles, systemUsers } from "./settings";

/*
 * 假数据口径：账号来自 data/settings 的用户列表，系统权限取自用户的系统角色，
 * 项目里的角色和权限取自 data/members。接口接通后，由 POST /auth/login 返回的 me 提供
 */

const noPermissions: MemberPermissions = {
  canEditTask: false,
  canEditSchedule: false,
  canEditDoc: false,
  canManageMember: false,
};

const allPermissions: MemberPermissions = {
  canEditTask: true,
  canEditSchedule: true,
  canEditDoc: true,
  canManageMember: true,
};

/** 所有账号（含已停用的），按用户列表顺序 */
export const accounts: Account[] = systemUsers.map((user) => {
  const member = members.find((m) => m.user.id === user.id);
  const role = roles.find((r) => r.id === user.roleId);
  return {
    user: { id: user.id, username: user.username, realName: user.realName },
    roleName: user.roleName,
    disabled: user.status === 0,
    systemPermissions: role?.permissions ?? [],
    projectRole: member?.projectRole ?? null,
    // 不在项目成员里的账号：超级管理员可以做所有事，其余只读
    permissions: member
      ? {
          canEditTask: member.canEditTask,
          canEditSchedule: member.canEditSchedule,
          canEditDoc: member.canEditDoc,
          canManageMember: member.canManageMember,
        }
      : user.roleCode === "SUPER_ADMIN"
        ? allPermissions
        : noPermissions,
  };
});
