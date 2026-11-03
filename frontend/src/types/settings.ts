/**
 * 系统管理类型定义（对齐 docs/api/openapi.yaml 的“用户管理”“角色权限”“系统管理”标签）
 * 共享结构（UserBrief 等）见 ./global
 */
import type { UserBrief } from "./global";

/** 用户（User），GET /users 的数组元素 */
export interface SystemUser {
  id: number;
  username: string;
  realName: string;
  /** 部门/小组，没有为空 */
  dept: string | null;
  roleId: number;
  roleCode: string;
  roleName: string;
  email: string | null;
  skillTags: string[];
  /** 每周工时上限（小时） */
  weeklyCapacity: number;
  /** 1 启用 0 停用 */
  status: 0 | 1;
  /** yyyy-MM-dd HH:mm:ss */
  lastLoginAt: string | null;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}

/** 修改个人信息请求体（ProfileUpdate），PUT /auth/me */
export interface ProfileUpdate {
  realName: string;
  email: string;
  skillTags: string[];
}

/** 新增用户请求体（UserCreate），POST /users */
export interface UserCreate {
  username: string;
  password: string;
  realName: string;
  dept?: string;
  roleId: number;
  email?: string;
  skillTags?: string[];
  weeklyCapacity?: number;
}

/** 角色（Role），GET /roles */
export interface Role {
  id: number;
  code: string;
  name: string;
  /** 拥有的权限编码 */
  permissions: string[];
  sort: number;
  userCount: number;
}

/** 权限项（Permission），GET /permissions */
export interface Permission {
  /** 例如 "project:task:move" */
  code: string;
  name: string;
  /** 分组，如 项目 */
  group: string;
}

/** 操作日志（LogItem），GET /logs */
export interface LogItem {
  id: number;
  user: UserBrief | null;
  project: { id: number; name: string } | null;
  /** TASK / DISCUSSION / DOCUMENT / AUTH / USER */
  targetType: string;
  targetId: number | null;
  action: string;
  detail: string | null;
  ip: string | null;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}

/** 系统参数（ConfigItem），GET /configs */
export interface ConfigItem {
  key: string;
  value: string;
  name: string;
  remark: string | null;
  /** yyyy-MM-dd HH:mm:ss */
  updatedAt: string;
}

/** 系统管理抽屉的分区 id */
export type SettingsSectionId =
  | "me"
  | "proj"
  | "people"
  | "roles"
  | "logs"
  | "params";
