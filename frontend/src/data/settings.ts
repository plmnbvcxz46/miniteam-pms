import type { UserBrief } from "../types/global";
import type {
  ConfigItem,
  LogItem,
  Permission,
  ProfileUpdate,
  Role,
  SystemUser,
} from "../types/settings";
import { users } from "./global";

/* 全局数据（登录用户、项目成员 UserBrief）见 ./global */

/*
 * 假数据口径（与其余页面同一天）：“今天”为 2026-10-22，项目成员 4 人，另有管理员和已停用的访客
 */

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 日志里 targetType 的中文名 */
export const logTargetLabel: Record<string, string> = {
  TASK: "任务",
  DISCUSSION: "协作",
  DOCUMENT: "文档",
  AUTH: "登录",
};

/** 日志里 action 的中文名 */
export const logActionLabel: Record<string, string> = {
  PROGRESS: "更新进度",
  MOVE: "移动任务",
  CREATE: "新建",
  COMMENT: "发表回复",
  UPLOAD: "上传文档",
  REVISE: "修订文档",
  LOGIN: "账号登录",
  LOGIN_FAIL: "账号登录",
};

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const { pmA, devA, devB, qaC } = users;
const guest: UserBrief = { id: 6, username: "guest", realName: "访客" };

/** 某个账号的个人资料（GET /auth/me 的 user） */
export function getProfile(userId: number): ProfileUpdate {
  const user = systemUsers.find((u) => u.id === userId);
  return {
    realName: user?.realName ?? "",
    email: user?.email ?? "",
    skillTags: user?.skillTags ?? [],
  };
}

/** GET /roles */
export const roles: Role[] = [
  {
    id: 1,
    code: "SUPER_ADMIN",
    name: "超级管理员",
    permissions: [
      "project:overview:view",
      "project:task:list",
      "project:task:move",
      "project:schedule:view",
      "project:schedule:edit",
      "project:report:view",
      "collab:thread:list",
      "collab:doc:list",
      "collab:doc:upload",
      "project:member:list",
      "system:view",
    ],
    sort: 1,
    userCount: 1,
  },
  {
    id: 2,
    code: "PM",
    name: "项目经理",
    permissions: [
      "project:overview:view",
      "project:task:list",
      "project:task:move",
      "project:schedule:view",
      "project:schedule:edit",
      "project:report:view",
      "collab:thread:list",
      "collab:doc:list",
      "collab:doc:upload",
      "project:member:list",
    ],
    sort: 2,
    userCount: 1,
  },
  {
    id: 3,
    code: "DEV",
    name: "开发",
    permissions: [
      "project:overview:view",
      "project:task:list",
      "project:task:move",
      "project:schedule:view",
      "project:report:view",
      "collab:thread:list",
      "collab:doc:list",
      "collab:doc:upload",
    ],
    sort: 3,
    userCount: 2,
  },
  {
    id: 4,
    code: "QA",
    name: "测试",
    permissions: [
      "project:overview:view",
      "project:task:list",
      "project:task:move",
      "project:schedule:view",
      "project:report:view",
      "collab:thread:list",
      "collab:doc:list",
      "collab:doc:upload",
    ],
    sort: 4,
    userCount: 1,
  },
  {
    id: 5,
    code: "READONLY",
    name: "只读",
    permissions: [
      "project:overview:view",
      "project:task:list",
      "project:schedule:view",
      "project:report:view",
      "collab:thread:list",
      "collab:doc:list",
    ],
    sort: 5,
    userCount: 1,
  },
];

/** GET /permissions，菜单权限（view / list）在前，按钮权限在后 */
export const permissions: Permission[] = [
  { code: "project:overview:view", name: "概览", group: "项目" },
  { code: "project:task:list", name: "任务", group: "项目" },
  { code: "project:task:move", name: "移动任务", group: "项目" },
  { code: "project:schedule:view", name: "进度", group: "项目" },
  { code: "project:schedule:edit", name: "调整排期", group: "项目" },
  { code: "project:report:view", name: "统计报表", group: "项目" },
  { code: "collab:thread:list", name: "团队协作", group: "协作" },
  { code: "collab:doc:list", name: "文档", group: "协作" },
  { code: "collab:doc:upload", name: "上传文档", group: "协作" },
  { code: "project:member:list", name: "成员与权限", group: "协作" },
  { code: "system:view", name: "系统管理", group: "管理" },
];

/** GET /users */
export const systemUsers: SystemUser[] = [
  {
    ...pmA,
    dept: "第 8 组",
    roleId: 2,
    roleCode: "PM",
    roleName: "项目经理",
    email: "pm_a@example.com",
    skillTags: ["项目管理", "需求分析"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 08:45:00",
    createdAt: "2026-09-20 10:00:00",
  },
  {
    ...devA,
    dept: "第 8 组",
    roleId: 3,
    roleCode: "DEV",
    roleName: "开发",
    email: "dev_a@example.com",
    skillTags: ["Java", "MyBatis"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 09:02:00",
    createdAt: "2026-09-20 10:05:00",
  },
  {
    ...devB,
    dept: "第 8 组",
    roleId: 3,
    roleCode: "DEV",
    roleName: "开发",
    email: "dev_b@example.com",
    skillTags: ["React", "TypeScript"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 09:10:00",
    createdAt: "2026-09-20 10:08:00",
  },
  {
    ...qaC,
    dept: "第 8 组",
    roleId: 4,
    roleCode: "QA",
    roleName: "测试",
    email: null,
    skillTags: ["测试用例"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-21 17:30:00",
    createdAt: "2026-09-20 10:12:00",
  },
  {
    id: 5,
    username: "admin",
    realName: "系统管理员",
    dept: null,
    roleId: 1,
    roleCode: "SUPER_ADMIN",
    roleName: "超级管理员",
    email: null,
    skillTags: [],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-20 14:00:00",
    createdAt: "2026-09-18 09:00:00",
  },
  {
    ...guest,
    dept: null,
    roleId: 5,
    roleCode: "READONLY",
    roleName: "只读",
    email: null,
    skillTags: [],
    weeklyCapacity: 40,
    status: 0,
    lastLoginAt: null,
    createdAt: "2026-10-01 09:00:00",
  },
];

/** GET /logs（按时间倒序） */
export const logs: LogItem[] = [
  { id: 107, user: devB, project: { id: 1, name: "测试项目 App" }, targetType: "TASK", targetId: 137, action: "PROGRESS", detail: "甘特图组件 进度 60%", ip: "10.0.0.12", createdAt: "2026-10-22 10:52:00" },
  { id: 106, user: devA, project: { id: 1, name: "测试项目 App" }, targetType: "DISCUSSION", targetId: 1, action: "COMMENT", detail: "接口文档字段命名统一", ip: "10.0.0.11", createdAt: "2026-10-22 10:41:00" },
  { id: 105, user: pmA, project: { id: 1, name: "测试项目 App" }, targetType: "TASK", targetId: 139, action: "MOVE", detail: "补全接口文档 移到阻塞", ip: "10.0.0.10", createdAt: "2026-10-22 09:30:00" },
  { id: 104, user: guest, project: null, targetType: "AUTH", targetId: null, action: "LOGIN_FAIL", detail: "账号已停用", ip: "10.0.0.88", createdAt: "2026-10-22 09:02:00" },
  { id: 103, user: qaC, project: { id: 1, name: "测试项目 App" }, targetType: "DOCUMENT", targetId: 8, action: "UPLOAD", detail: "答辩 PPT 第二版", ip: "10.0.0.13", createdAt: "2026-10-21 18:02:00" },
  { id: 102, user: pmA, project: { id: 1, name: "测试项目 App" }, targetType: "TASK", targetId: 150, action: "CREATE", detail: "部署脚本", ip: "10.0.0.10", createdAt: "2026-10-21 15:20:00" },
  { id: 101, user: devB, project: { id: 1, name: "测试项目 App" }, targetType: "DOCUMENT", targetId: 3, action: "REVISE", detail: "接口文档", ip: "10.0.0.12", createdAt: "2026-10-21 09:12:00" },
];

/** GET /configs */
export const configs: ConfigItem[] = [
  { key: "account.default_password", value: "********", name: "新用户默认密码", remark: "新增人员和重置密码时使用", updatedAt: "2026-09-18 09:00:00" },
  { key: "account.allow_register", value: "false", name: "允许自助注册", remark: null, updatedAt: "2026-09-18 09:00:00" },
  { key: "account.lock_threshold", value: "5", name: "登录失败锁定", remark: "连续失败多少次后锁定账号", updatedAt: "2026-09-18 09:00:00" },
  { key: "account.session_minutes", value: "120", name: "会话超时", remark: "分钟", updatedAt: "2026-09-18 09:00:00" },
  { key: "layout.headline_max", value: "24", name: "头条字数上限", remark: null, updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.importance", value: "0.4", name: "重要度权重", remark: "四个权重之和须为 1", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.urgency", value: "0.3", name: "紧急度权重", remark: "四个权重之和须为 1", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.dependency", value: "0.2", name: "依赖影响权重", remark: "四个权重之和须为 1", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.delay", value: "0.1", name: "延期风险权重", remark: "四个权重之和须为 1", updatedAt: "2026-09-18 09:00:00" },
];
