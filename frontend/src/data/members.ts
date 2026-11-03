import type { Activity, UserBrief } from "../types/global";
import type { Member, MemberSnapshot, PermDef } from "../types/members";
import { currentIssue, currentProjectId, users } from "./global";
import { defaultWeeklyCapacity } from "./settings";

/* 全局数据（登录用户、项目 ID、期号、角色名）见 ./global */

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 4 个权限行的标题和说明，顺序即表格行顺序 */
export const permDefs: PermDef[] = [
  { key: "canEditTask", label: "编辑任务", desc: "新建、修改任务，调整他人任务的状态" },
  { key: "canEditSchedule", label: "调整排期", desc: "修改工期和依赖，重算关键路径" },
  { key: "canEditDoc", label: "编辑文档", desc: "上传新版本，修改文档状态" },
  { key: "canManageMember", label: "管理成员", desc: "邀请成员，修改本页的权限" },
];

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const { pmA, devA, devB, qaC } = users;

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
    canEditTask: false,
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
    canEditTask: false,
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
    canEditTask: false,
    canEditSchedule: false,
    canEditDoc: true,
    canManageMember: false,
  },
];

/** 按项目角色给默认权限：项目经理全开，其他人只有编辑文档 */
export function makeMember(
  user: UserBrief,
  projectRole: Member["projectRole"],
  position: string,
  joinedAt: string,
): Member {
  const isPm = projectRole === "PM";
  return {
    user,
    projectRole,
    position,
    weeklyHours: 0,
    weeklyCapacity: defaultWeeklyCapacity,
    overCapacity: false,
    taskCount: 0,
    joinedAt,
    canEditTask: isPm,
    canEditSchedule: isPm,
    canEditDoc: true,
    canManageMember: isPm,
  };
}

/**
 * 各个项目的成员，按项目 id。只有项目 1 有完整的任务、文档等数据，
 * 其他项目只有成员关系，用来区分一个人在不同项目里的角色和权限。
 * 系统管理员不用在这里，他对所有项目开放
 */
export const projectMembers: Record<number, Member[]> = {
  1: members,
  2: [
    makeMember(devB, "PM", "前端开发", "2026-10-05 09:00:00"),
    makeMember(pmA, "MEMBER", "评审", "2026-10-05 09:10:00"),
    makeMember(qaC, "TESTER", "测试", "2026-10-06 10:00:00"),
  ],
  3: [
    makeMember(pmA, "PM", "项目经理", "2026-03-02 09:00:00"),
    makeMember(devA, "MEMBER", "后端开发", "2026-03-02 09:20:00"),
  ],
};

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

/** 各个项目的变更记录，按项目 id；只有项目 1 有历史记录 */
export const projectPermLogs: Record<number, Activity[]> = {
  1: permLogs,
  2: [],
  3: [],
};

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

