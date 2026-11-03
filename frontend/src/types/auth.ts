/**
 * 认证类型（对齐 docs/api/openapi.yaml 的“认证”标签）
 * 共享结构（UserBrief、ProjectRole、MemberPermissions 等）见 ./global
 */
import type { UserBrief } from "./global";

/** 登录请求体（LoginRequest），POST /auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录后的身份，对应 GET /auth/me（CurrentUser）。
 * 只管“你是谁、系统层面能做什么”；在某个项目里的角色和权限不放这里，
 * 由 src/access/ 按当前项目的成员关系算出
 * - systemPermissions：系统权限编码，有 system:view 的是系统管理员
 */
export interface Account {
  user: UserBrief;
  /** 系统角色名：系统管理员 / 普通用户 */
  roleName: string;
  /** 已停用的账号不能登录，也不能切换到 */
  disabled: boolean;
  systemPermissions: string[];
}

/** 系统管理员：有 system:view。所有项目、所有权限都对他开放 */
export function isSystemAdmin(account: Account): boolean {
  return account.systemPermissions.includes("system:view");
}

/** 注册请求体（RegisterRequest），POST /auth/register */
export interface RegisterRequest {
  username: string;
  password: string;
  realName: string;
}

/** 表单里可能出错的字段 */
export type AuthField = "realName" | "username" | "password";

/** 登录结果：成功带身份，失败带出错的字段和写给用户看的原因 */
export type LoginResult =
  | { ok: true; account: Account }
  | { ok: false; field: AuthField; message: string };

/** 注册结果：成功后不自动登录，回到登录页 */
export type RegisterResult =
  | { ok: true }
  | { ok: false; field: AuthField; message: string };
