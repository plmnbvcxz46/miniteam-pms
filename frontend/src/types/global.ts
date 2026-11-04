/**
 * 全局共享类型（登录态、项目上下文、多个模块共用的接口结构）
 * 对齐 docs/api/openapi.yaml
 */

/** 分页结果：接口里的列表统一返回 { total, list } */
export interface PageResult<T> {
  total: number;
  list: T[];
}

/** 用户简要信息（UserBrief） */
export interface UserBrief {
  id: number;
  /** 账号，例如 "pm_a" */
  username: string;
  /** 姓名，例如 "测试经理 A" */
  realName: string;
}

/** 任务引用（TaskRef），报表、文档、讨论等处引用任务时共用 */
export interface TaskRef {
  id: number;
  /** 项目内编号，显示为 T-编号 */
  taskNo: number;
  title: string;
}

/** 任务状态（TaskStatus）：TODO 待开始 / DOING 进行中 / BLOCKED 阻塞 / DONE 已完成 */
export type TaskStatus = "TODO" | "DOING" | "BLOCKED" | "DONE";

/** 文档引用（DocumentRef），评论里 @ 文档时用 */
export interface DocumentRef {
  id: number;
  name: string;
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

/** 项目起止日期（对应 ProjectSummary 的 startDate / planEnd） */
export interface ProjectPeriod {
  /** yyyy-MM-dd */
  startDate: string;
  /** yyyy-MM-dd */
  planEnd: string;
}

/** 当前期号信息（顶栏“第 32 期 2026 年 10 月 22 日 周四”） */
export interface IssueInfo {
  issueNo: string;
  /** "M.DD"，例如 "10.22"、"9.05" */
  todayDate: string;
  fullDate: string;
}


/** 项目状态（ProjectStatus）：ACTIVE 进行中 / ARCHIVED 已归档 */
export type ProjectStatus = "ACTIVE" | "ARCHIVED";

/** 项目切换浮层里的一项（ProjectSummary），GET /projects */
export interface ProjectSummary extends ProjectPeriod {
  id: number;
  name: string;
  status: ProjectStatus;
  /** 今日期号 */
  issueNo: number;
  /** 今日头条 */
  headline: string | null;
  myProjectRole: ProjectRole | null;
}

/** 项目详情（Project），GET /projects/{projectId} */
export interface Project extends ProjectPeriod {
  id: number;
  name: string;
  description: string | null;
  /** 创建项目的人 */
  owner: UserBrief;
  status: ProjectStatus;
  /** 实际结束日期 yyyy-MM-dd，归档时记下 */
  actualEnd: string | null;
  issueNo: number;
  totalWeeks: number;
  currentWeek: number;
  myProjectRole: ProjectRole | null;
  /** 我在这个项目里的权限，系统管理员全是 true */
  myPermissions: MemberPermissions;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}

/** 新建项目请求体（ProjectSave），POST /projects */
export interface ProjectSave extends ProjectPeriod {
  name: string;
  description?: string;
}

/** 往期列表的一项（IssueSummary），GET /projects/{projectId}/issues */
export interface IssueSummary {
  issueNo: number;
  /** yyyy-MM-dd */
  issueDate: string;
  headline: string | null;
  /** 预计完工日期 yyyy-MM-dd */
  predictedEnd: string | null;
  delayDays: number;
  risk: boolean;
}

/** 通知类型（NotificationType）：ASSIGN 指派 / MENTION 被@ / DELAY 延期预警 / DEFECT 缺陷 / SYSTEM 系统 */
export type NotificationType =
  | "ASSIGN"
  | "MENTION"
  | "DELAY"
  | "DEFECT"
  | "SYSTEM";

/** 通知（Notification），GET /notifications */
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string | null;
  /** 前端路由，可带查询参数，例如 "/collab?discussionId=1&commentId=103" */
  link: string | null;
  isRead: boolean;
  projectId: number | null;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}
