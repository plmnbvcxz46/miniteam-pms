import type {
  IssueInfo,
  IssueSummary,
  Notification,
  NotificationType,
  ProjectRole,
  ProjectSummary,
  TaskStatus,
  UserBrief,
} from "../types/global";

/**
 * 全局假数据：登录态 / 当前项目 / 当前期号
 * 后续接入全局状态（或接口）后，只需替换本文件的来源
 */

/** 当前项目 ID（对应路由或全局项目上下文） */
export const currentProjectId = 1;

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

/** GET /projects，项目切换浮层 */
export const projects: ProjectSummary[] = [
  {
    id: 1,
    name: "测试项目 App",
    status: "ACTIVE",
    startDate: "2026-09-21",
    planEnd: "2026-11-29",
    issueNo: 32,
    headline: "接口文档逾期 2 天，已移到阻塞",
    myProjectRole: "PM",
  },
  {
    id: 2,
    name: "课程设计网站",
    status: "ACTIVE",
    startDate: "2026-10-05",
    planEnd: "2026-12-20",
    issueNo: 18,
    headline: null,
    myProjectRole: "MEMBER",
  },
  {
    id: 3,
    name: "数据库实验",
    status: "ARCHIVED",
    startDate: "2026-03-02",
    planEnd: "2026-06-21",
    issueNo: 112,
    headline: null,
    myProjectRole: "PM",
  },
];

/** GET /projects/{projectId} 的 description，按项目 id */
export const projectDescriptions: Record<number, string> = {
  1: "小型软件团队项目管理系统的课程设计",
  2: "",
  3: "数据库课程实验，已结项",
};

/** GET /projects/{projectId}/issues，按期号倒序，第一项是今天 */
export const issues: IssueSummary[] = [
  { issueNo: 32, issueDate: "2026-10-22", headline: "接口文档逾期 2 天，已移到阻塞", predictedEnd: "2026-12-01", delayDays: 2, risk: true },
  { issueNo: 31, issueDate: "2026-10-21", headline: "答辩 PPT 第二版上传", predictedEnd: "2026-11-30", delayDays: 1, risk: true },
  { issueNo: 30, issueDate: "2026-10-20", headline: "数据库表设计评审通过", predictedEnd: "2026-11-29", delayDays: 0, risk: false },
  { issueNo: 29, issueDate: "2026-10-19", headline: "周会确定彩排时间", predictedEnd: "2026-11-29", delayDays: 0, risk: false },
  { issueNo: 28, issueDate: "2026-10-18", headline: null, predictedEnd: "2026-11-29", delayDays: 0, risk: false },
  { issueNo: 27, issueDate: "2026-10-17", headline: "菜单接口开始联调", predictedEnd: "2026-11-29", delayDays: 0, risk: false },
  { issueNo: 26, issueDate: "2026-10-16", headline: "甘特图依赖线方案定稿", predictedEnd: "2026-11-28", delayDays: 0, risk: false },
  { issueNo: 25, issueDate: "2026-10-15", headline: null, predictedEnd: "2026-11-28", delayDays: 0, risk: false },
  { issueNo: 24, issueDate: "2026-10-14", headline: "看板拖拽完成", predictedEnd: "2026-11-28", delayDays: 0, risk: false },
  { issueNo: 23, issueDate: "2026-10-13", headline: "权限模型确认", predictedEnd: "2026-11-27", delayDays: 0, risk: false },
];

/** GET /notifications，按时间倒序。未读数量由 isRead 算出 */
export const notifications: Notification[] = [
  {
    id: 5,
    type: "MENTION",
    title: "普通员工 A 在“接口文档字段命名统一”里 @ 了你",
    content: "权限部分卡在按钮级权限标识的格式上，project:task:move 这种三段式可以吗？",
    link: "/collab?discussionId=1&commentId=103",
    isRead: false,
    projectId: 1,
    createdAt: "2026-10-22 09:18:00",
  },
  {
    id: 4,
    type: "DELAY",
    title: "T-139 补全接口文档已逾期 2 天",
    content: "任务已移到阻塞，计划完成日期 2026-10-20。",
    link: "/board/task?id=139",
    isRead: false,
    projectId: 1,
    createdAt: "2026-10-22 08:00:00",
  },
  {
    id: 3,
    type: "MENTION",
    title: "普通员工 C 在“周五彩排时间”里 @ 了你",
    content: "彩排顺序我写进 PPT 最后一页了，你看一下。",
    link: "/collab?discussionId=3&commentId=304",
    isRead: false,
    projectId: 1,
    createdAt: "2026-10-21 15:02:00",
  },
  {
    id: 2,
    type: "MENTION",
    title: "普通员工 B 在“甘特图依赖线怎么画”里 @ 了你",
    content: "依赖线打算用 SVG 按任务条的实际位置生成。",
    link: "/collab?discussionId=2&commentId=201",
    isRead: true,
    projectId: 1,
    createdAt: "2026-10-21 10:02:00",
  },
  {
    id: 1,
    type: "SYSTEM",
    title: "第 31 期日报已生成",
    content: null,
    link: null,
    isRead: true,
    projectId: 1,
    createdAt: "2026-10-21 00:00:00",
  },
];

/** 项目日期，与顶栏“2026 年 10 月 22 日”同一天。通过 utils/date 的 getProjectToday() 读取 */
export const projectTodayDate = "2026-10-22";

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

/** 通知类型中文名 */
export const notificationTypeLabel: Record<NotificationType, string> = {
  ASSIGN: "指派",
  MENTION: "被 @",
  DELAY: "延期",
  DEFECT: "缺陷",
  SYSTEM: "系统",
};

/** 角色中文名 */
export const roleLabel: Record<ProjectRole, string> = {
  PM: "项目经理",
  MEMBER: "普通成员",
  TESTER: "测试人员",
};

/** 任务状态中文名 */
export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: "待开始",
  DOING: "进行中",
  BLOCKED: "阻塞",
  DONE: "已完成",
};


