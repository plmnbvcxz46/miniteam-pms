/**
 * 进度模块类型定义（对齐 docs/api/openapi.yaml 的甘特图、关键路径、总览、待办、优先级排名、往期日报）
 * 共享结构（UserBrief、TaskRef、IssueSummary 等）见 ./global
 */
import type { IssueSummary, TaskRef, TaskStatus } from "./global";
import type { Reports } from "./reports";
import type { TaskDetail } from "./task";

/** 甘特图里的一个任务（GanttTask） */
export interface GanttTask {
  taskId: number;
  /** 字母编号 A、B、…、Z、AA… */
  label: string;
  title: string;
  planStart: string;
  planEnd: string;
  predictedEnd: string;
  status: TaskStatus;
  /** 总时差为 0（已完成的也算） */
  critical: boolean;
  /** 总时差（工作日） */
  totalFloat: number;
  overrunDays: number;
}

/** 甘特图（Gantt），GET /projects/{projectId}/gantt */
export interface Gantt {
  scope: string;
  from: string;
  to: string;
  today: string;
  tasks: GanttTask[];
  /** 总工期（工作日） */
  totalDuration: number;
  plannedEnd: string;
  predictedEnd: string;
  delayDays: number;
}

/** 关键路径面板的一行（CpmRow） */
export interface CpmApiRow {
  taskId: number;
  label: string;
  title: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  totalFloat: number;
  critical: boolean;
}

/** 关键路径计算（CriticalPath），GET /projects/{projectId}/critical-path */
export interface CriticalPath {
  unit: string;
  rows: CpmApiRow[];
  /** 关键路径任务 ID，按最早开始排 */
  path: number[];
  pathLabels: string[];
  totalDuration: number;
  plannedEnd: string;
  predictedEnd: string;
  delayDays: number;
  /** 拖得最久的未完成关键任务 */
  delayCause: TaskRef | null;
}

/** 今日待办的一项（TodoItem） */
export interface TodoItem {
  task: TaskRef;
  dueDate: string | null;
  score: number;
  /** 逾期 / 今天 / 周几 / 下周几 / M月D日 / 无截止 */
  dueTag: string;
  overdueDays: number;
}

/** 优先级排名的一项（PriorityItem），GET /projects/{projectId}/priority-ranking */
export interface PriorityItem {
  rank: number;
  task: TaskRef;
  score: number;
  importance: number;
  urgency: number;
  timeUrgency: number;
  blockImpact: number;
  critical: boolean;
}

/** 总览顶部四个数字 */
export interface OverviewStats {
  done: number;
  total: number;
  remaining: number;
  /** 剩余任务中在关键路径上的 */
  criticalRemaining: number;
  overdue: number;
  /** 距计划结束天数 */
  remainingDays: number;
  planEnd: string;
}

/** 今日头条（HeadlineBlock） */
export interface Headline {
  /** 整句话，逗号前后各一段 */
  title: string;
  risk: boolean;
  delayDays: number;
  plannedEnd: string;
  predictedEnd: string;
  blockedTasks: TaskRef[];
  /** “查看”跳转的任务，没有逾期为空 */
  targetTaskId: number | null;
}

/** 成员排期里的一条任务条（ScheduleBar），start、end 都含 */
export interface ScheduleBar {
  taskId: number;
  title: string;
  start: string;
  end: string;
  status: TaskStatus;
}

/** 成员排期的一行（ScheduleRow） */
export interface ScheduleRow {
  user: { id: number; username: string; realName: string };
  bars: ScheduleBar[];
}

/** 关键路径上的一个节点（CriticalNode） */
export interface CriticalNode {
  taskId: number;
  label: string;
  title: string;
  status: TaskStatus;
  /** 逾期天数 */
  overrunDays: number;
}

/** 概览（Overview），GET /projects/{projectId}/overview */
export interface Overview {
  issueNo: number;
  date: string;
  stats: OverviewStats;
  headline: Headline;
  schedule: { from: string; to: string; rows: ScheduleRow[] };
  todo: TodoItem[];
  todoTotal: number;
  progress: { percent: number; done: number; remaining: number; total: number };
  criticalPath: {
    nodes: CriticalNode[];
    /** 总工期（工作日） */
    totalDuration: number;
    plannedEnd: string;
    predictedEnd: string;
  };
}

/** 往期快照里的成员：那天已在项目里的人和当时的负载 */
export interface PastMember {
  user: { id: number; username: string; realName: string };
  joinedAt: string;
  weeklyCapacity: number;
  weeklyHours: number;
  taskCount: number;
  overCapacity: boolean;
}

/** 往期快照里的各页面数据（IssueSnapshot.snapshot），结构同对应的实时接口 */
export interface IssuePages {
  tasks: TaskDetail[];
  overview: Overview;
  gantt: Gantt;
  criticalPath: CriticalPath;
  reports: Reports;
  members: PastMember[];
}

/** 某一期（IssueSnapshot），GET /projects/{projectId}/issues/{issueDate} */
export interface IssueSnapshot extends IssueSummary {
  snapshot: IssuePages;
}
