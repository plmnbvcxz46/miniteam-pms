/**
 * 认证类型（对齐 docs/api/openapi.yaml 的“认证”标签）
 * 共享结构（UserBrief、ProjectRole、MemberPermissions 等）见 ./global
 */
import type { MemberPermissions, ProjectRole, UserBrief } from "./global";

/** 登录请求体（LoginRequest），POST /auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录后的身份，对应 GET /auth/me（CurrentUser）加上当前项目里的角色和权限
 * - systemPermissions：系统权限编码，决定系统管理里能看哪些分区
 * - projectRole / permissions：在当前项目里的角色和权限，不在项目里时为 null 和全 false
 */
export interface Account {
  user: UserBrief;
  /** 系统角色名，例如 “项目经理” */
  roleName: string;
  /** 已停用的账号不能登录，也不能切换到 */
  disabled: boolean;
  systemPermissions: string[];
  projectRole: ProjectRole | null;
  permissions: MemberPermissions;
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
