/**
 * 全局共享类型（登录态、项目上下文、多个模块共用的接口结构）
 * 对齐 docs/api/openapi.yaml
 */

/** 用户简要信息（UserBrief） */
export interface UserBrief {
  id: number;
  /** 账号，例如 "pm_a" */
  username: string;
  /** 姓名，例如 "测试经理 A" */
  realName: string;
}

/** 项目内角色（ProjectRole）：PM 项目经理 / MEMBER 普通成员 / TESTER 测试人员 */
export type ProjectRole = "PM" | "MEMBER" | "TESTER";

/** 项目权限（MemberPermissions），成员列表和 ProjectDetail.myPermissions 共用 */
export interface MemberPermissions {
  /** 新建、修改任务，拖动看板 */
  canEditTask: boolean;
  /** 修改工期和依赖 */
  canEditSchedule: boolean;
  /** 上传新版本，修改文档状态 */
  canEditDoc: boolean;
  /** 邀请成员，修改权限 */
  canManageMember: boolean;
}

/** 权限字段名 */
export type PermKey = keyof MemberPermissions;

/** 项目动态（Activity），协作页动态栏和成员页权限变更共用 */
export interface Activity {
  id: number;
  /** 操作人，系统操作为空 */
  user: UserBrief | null;
  /** TASK / DOCUMENT / MEMBER / PROJECT / DEFECT / DISCUSSION */
  targetType: string;
  targetId: number | null;
  action: string;
  /** 展示文案，例如 "测试经理 A 授予 普通员工 B 编辑文档" */
  detail: string;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}

/** 当前期号信息（顶栏“第 32 期 2026 年 10 月 22 日 周四”） */
export interface IssueInfo {
  issueNo: string;
  /** "M.DD"，例如 "10.22"、"9.05" */
  todayDate: string;
  fullDate: string;
}

