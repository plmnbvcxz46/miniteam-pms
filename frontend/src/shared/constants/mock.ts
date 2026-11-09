import type { UserBrief } from "../types/global";
import type { ConfigItem, ProfileUpdate, SystemUser } from "../types/settings";

/*
 * 还没换成接口的替身数据，换掉一处删一处，全删完就删掉本文件：
 * - getProfile / systemUsers：个人页的技能标签，应改用 GET /auth/me
 * - configs：系统参数接口没取到时的默认值
 */

/**
 * 当前项目的成员用户（UserBrief），各模块假数据统一从这里取，避免重复定义
 * 将来由 GET /projects/{projectId}/members 的 user 字段提供
 */
export const users = {
  pmA: { id: 1, username: "pm_a", realName: "测试经理 A" },
  devA: { id: 2, username: "dev_a", realName: "普通员工 A" },
  devB: { id: 3, username: "dev_b", realName: "普通员工 B" },
  qaC: { id: 4, username: "qa_c", realName: "普通员工 C" },
} satisfies Record<string, UserBrief>;


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

/** GET /users */
export const systemUsers: SystemUser[] = [
  {
    ...pmA,
    dept: null,
    roleId: 2,
    roleCode: "USER",
    roleName: "普通用户",
    email: "pm_a@example.com",
    skillTags: ["项目管理", "需求分析"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 08:45:00",
    createdAt: "2026-09-20 10:00:00",
  },
  {
    ...devA,
    dept: null,
    roleId: 2,
    roleCode: "USER",
    roleName: "普通用户",
    email: "dev_a@example.com",
    skillTags: ["Java", "MyBatis"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 09:02:00",
    createdAt: "2026-09-20 10:05:00",
  },
  {
    ...devB,
    dept: null,
    roleId: 2,
    roleCode: "USER",
    roleName: "普通用户",
    email: "dev_b@example.com",
    skillTags: ["React", "TypeScript"],
    weeklyCapacity: 40,
    status: 1,
    lastLoginAt: "2026-10-22 09:10:00",
    createdAt: "2026-09-20 10:08:00",
  },
  {
    ...qaC,
    dept: null,
    roleId: 2,
    roleCode: "USER",
    roleName: "普通用户",
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
    roleCode: "ADMIN",
    roleName: "系统管理员",
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
    roleId: 2,
    roleCode: "USER",
    roleName: "普通用户",
    email: null,
    skillTags: [],
    weeklyCapacity: 40,
    status: 0,
    lastLoginAt: null,
    createdAt: "2026-10-01 09:00:00",
  },
];

/** GET /configs */
export const configs: ConfigItem[] = [
  { key: "priority.weight.importance", value: "0.30", name: "优先级权重 w1", remark: "重要度", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.urgency", value: "0.30", name: "优先级权重 w2", remark: "紧急度", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.time", value: "0.25", name: "优先级权重 w3", remark: "时间紧迫度", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.weight.block", value: "0.15", name: "优先级权重 w4", remark: "阻塞影响度", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.alpha", value: "0.5", name: "关键路径加权系数 α", remark: "阻塞影响度中关键路径任务的额外加权", updatedAt: "2026-09-18 09:00:00" },
  { key: "priority.top_n", value: "5", name: "今日待办条数", remark: null, updatedAt: "2026-09-18 09:00:00" },
  { key: "member.weekly_capacity", value: "40", name: "默认每周工时上限", remark: "小时", updatedAt: "2026-09-18 09:00:00" },
];
