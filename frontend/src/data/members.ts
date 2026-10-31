import type { Activity, UserBrief } from "../types/global";
import type { Member, MemberSnapshot, PermDef } from "../types/members";
import { currentIssue, currentProjectId, currentUser } from "./global";

/* 全局数据（登录用户、项目 ID、期号、角色名）见 ./global */

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 4 个权限行的标题和说明，顺序即表格行顺序 */
export const permDefs: PermDef[] = [
  { key: "canEditTask", label: "编辑任务", desc: "新建、修改任务，拖动看板卡片" },
  { key: "canEditSchedule", label: "调整排期", desc: "修改工期和依赖，重算关键路径" },
  { key: "canEditDoc", label: "编辑文档", desc: "上传新版本，修改文档状态" },
  { key: "canManageMember", label: "管理成员", desc: "邀请成员，修改本页的权限" },
];

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const pmA: UserBrief = currentUser;
const devA: UserBrief = { id: 2, username: "dev_a", realName: "普通员工 A" };
const devB: UserBrief = { id: 3, username: "dev_b", realName: "普通员工 B" };
const qaC: UserBrief = { id: 4, username: "qa_c", realName: "普通员工 C" };

/** GET /projects/{projectId}/members */
export const members: Member[] = [
  {
    user: pmA,
    projectRole: "PM",
    position: "项目经理",
    weeklyHours: 46,
    weeklyCapacity: 40,
    overCapacity: true,
    taskCount: 4,
    joinedAt: "2026-09-21 09:00:00",
    canEditTask: true,
    canEditSchedule: true,
    canEditDoc: true,
    canManageMember: true,
  },
  {
    user: devA,
    projectRole: "MEMBER",
    position: "后端开发",
    weeklyHours: 38,
    weeklyCapacity: 40,
    overCapacity: false,
    taskCount: 5,
    joinedAt: "2026-09-21 10:12:00",
    canEditTask: true,
    canEditSchedule: false,
    canEditDoc: true,
    canManageMember: false,
  },
  {
    user: devB,
    projectRole: "MEMBER",
    position: "前端开发",
    weeklyHours: 32,
    weeklyCapacity: 40,
    overCapacity: false,
    taskCount: 3,
    joinedAt: "2026-09-21 10:15:00",
    canEditTask: true,
    canEditSchedule: false,
    canEditDoc: true,
    canManageMember: false,
  },
  {
    user: qaC,
    projectRole: "TESTER",
    position: "测试",
    weeklyHours: 24,
    weeklyCapacity: 40,
    overCapacity: false,
    taskCount: 3,
    joinedAt: "2026-09-22 14:30:00",
    canEditTask: true,
    canEditSchedule: false,
    canEditDoc: false,
    canManageMember: false,
  },
];

/** GET /projects/{projectId}/activities?targetType=MEMBER（按时间倒序） */
export const permLogs: Activity[] = [
  {
    id: 104,
    user: pmA,
    targetType: "MEMBER",
    targetId: devB.id,
    action: "GRANT",
    detail: "测试经理 A 授予 普通员工 B 编辑文档",
    createdAt: "2026-10-21 16:20:00",
  },
  {
    id: 103,
    user: pmA,
    targetType: "MEMBER",
    targetId: qaC.id,
    action: "REVOKE",
    detail: "测试经理 A 收回 普通员工 C 调整排期",
    createdAt: "2026-10-15 11:05:00",
  },
  {
    id: 102,
    user: pmA,
    targetType: "MEMBER",
    targetId: qaC.id,
    action: "INVITE",
    detail: "测试经理 A 邀请 普通员工 C 加入项目",
    createdAt: "2026-09-22 14:30:00",
  },
  {
    id: 101,
    user: pmA,
    targetType: "PROJECT",
    targetId: currentProjectId,
    action: "CREATE",
    detail: "测试经理 A 创建项目",
    createdAt: "2026-09-21 09:00:00",
  },
];

/** GET /users/search?keyword=...（邀请成员抽屉的候选人，已排除项目内成员） */
export const inviteCandidates: UserBrief[] = [
  { id: 5, username: "dev_d", realName: "普通员工 D" },
  { id: 6, username: "dev_e", realName: "普通员工 E" },
  { id: 7, username: "qa_f", realName: "测试员 F" },
];

/** 当前默认期数快照对象 */
export const currentSnapshot: MemberSnapshot = {
  ...currentIssue,
  members,
  permLogs,
};

