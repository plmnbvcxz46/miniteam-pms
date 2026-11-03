/**
 * 认证类型（对齐 docs/api/openapi.yaml 的“认证”标签）
 * 共享结构（UserBrief、ProjectRole、MemberPermissions 等）见 ./global
 */
import type { UserBrief } from "./global";
import type { SystemUser } from "./settings";

/** 登录请求体（LoginRequest），POST /auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** GET /auth/me（CurrentUser）：用户资料 + 系统权限编码 */
export interface CurrentUser {
  user: SystemUser;
  permissions: string[];
}

/** 登录响应（LoginResult），POST /auth/login */
export interface LoginResponse {
  token: string;
  /** token 有效期（秒） */
  expiresIn: number;
  me: CurrentUser;
}

/**
 * 登录后的身份，由 GET /auth/me 得出。
 * 只管“你是谁、系统层面能做什么”；在某个项目里的角色和权限不放这里，
 * 由 src/access/ 按当前项目的成员关系算出
 * - systemPermissions：系统权限编码，有 system:view 的是系统管理员
 */
export interface Account {
  user: UserBrief;
  /** 系统角色名：系统管理员 / 普通用户 */
  roleName: string;
  email: string | null;
  skillTags: string[];
  systemPermissions: string[];
}

/** 接口的 CurrentUser 转成前端用的 Account */
export function toAccount({ user, permissions }: CurrentUser): Account {
  return {
    user: { id: user.id, username: user.username, realName: user.realName },
    roleName: user.roleName,
    email: user.email,
    skillTags: user.skillTags,
    systemPermissions: permissions,
  };
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
