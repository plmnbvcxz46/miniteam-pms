import type { Account } from "../types/auth";
import { roles, systemUsers } from "./settings";

/*
 * 假数据口径：账号来自 data/settings 的用户列表，系统权限取自用户的系统角色。
 * 在项目里的角色和权限不在这里，见 data/members 的 projectMembers
 */

/** 所有账号（含已停用的），按用户列表顺序 */
export const accounts: Account[] = systemUsers.map((user) => ({
  user: { id: user.id, username: user.username, realName: user.realName },
  roleName: user.roleName,
  disabled: user.status === 0,
  systemPermissions: roles.find((r) => r.id === user.roleId)?.permissions ?? [],
}));
