import type {
  IssueInfo,
  MemberPermissions,
  ProjectRole,
  UserBrief,
} from "../types/global";

/**
 * 全局假数据：登录态 / 当前项目 / 当前期号
 * 后续接入全局状态（或接口）后，只需替换本文件的来源
 */

/** 当前项目 ID（对应路由或全局项目上下文） */
export const currentProjectId = 1;

/** 当前登录用户（对应 GET /auth/me） */
export const currentUser: UserBrief = {
  id: 1,
  username: "pm_a",
  realName: "测试经理 A",
};

/**
 * 当前项目的成员用户（UserBrief），各模块假数据统一从这里取，避免重复定义
 * 将来由 GET /projects/{projectId}/members 的 user 字段提供
 */
export const users = {
  pmA: currentUser,
  devA: { id: 2, username: "dev_a", realName: "普通员工 A" },
  devB: { id: 3, username: "dev_b", realName: "普通员工 B" },
  qaC: { id: 4, username: "qa_c", realName: "普通员工 C" },
} satisfies Record<string, UserBrief>;

/** 我在当前项目的角色（对应 ProjectDetail.myProjectRole） */
export const myProjectRole: ProjectRole = "PM";

/** 我在当前项目的权限（对应 ProjectDetail.myPermissions） */
export const myPermissions: MemberPermissions = {
  canEditTask: true,
  canEditSchedule: true,
  canEditDoc: true,
  canManageMember: true,
};

/** 本地当前日期（按 Asia/Shanghai），纯前端计算，不走接口 */
const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
);
const weekLabel = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 当前期号
 * - issueNo：期号由项目开始日期决定，将来取 ProjectDetail.issueNo
 * - todayDate / fullDate：直接取本地当前日期
 */
export const currentIssue: IssueInfo = {
  issueNo: "第 32 期",
  todayDate: `${now.getMonth() + 1}.${String(now.getDate()).padStart(2, "0")}`,
  fullDate: `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 周${weekLabel[now.getDay()]}`,
};

/** 角色中文名 */
export const roleLabel: Record<ProjectRole, string> = {
  PM: "项目经理",
  MEMBER: "普通成员",
  TESTER: "测试人员",
};

