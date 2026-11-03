/**
 * 任务模块类型定义（对齐 docs/api/openapi.yaml 的“任务”标签）
 * 共享结构（UserBrief、TaskRef、TaskStatus 等）见 ./global
 */
import type { DiscussionBrief } from "./collab";
import type { TaskRef, TaskStatus, UserBrief } from "./global";

/** 优先级（Priority） */
export interface Priority {
  /** 高 / 中 / 低 */
  label: string;
  /** 0-100 */
  score: number;
}

/** 文档状态（DocStatus）：REVISING 修订中 / FINAL 定稿 */
export type DocStatus = "REVISING" | "FINAL";

/** 文档简要信息（DocumentBrief），TaskDetail.documents 数组元素 */
export interface DocumentBrief {
  id: number;
  name: string;
  currentVersion: string | null;
  status: DocStatus;
  /** 已逾期天数，未逾期为 0 */
  overdueDays: number;
}

/** 看板任务卡片（TaskCard） */
export interface TaskCard {
  id: number;
  /** 项目内编号，显示为 T-编号 */
  taskNo: number;
  title: string;
  status: TaskStatus;
  /** 空为未分配 */
  assignee: UserBrief | null;
  /** yyyy-MM-dd */
  dueDate: string | null;
  /** 0-100 */
  progress: number;
  priority: Priority;
  /** 在关键路径上 */
  critical: boolean;
  /** 已逾期天数，未逾期为 0 */
  overdueDays: number;
  sortOrder: number;
  parentId: number | null;
  milestoneId: number | null;
  /** yyyy-MM-dd */
  actualEnd: string | null;
}

/** 前置 / 后续任务（DependencyTask） */
export interface DependencyTask {
  dependencyId: number;
  task: TaskRef;
  assignee: UserBrief | null;
  status: TaskStatus;
}

/** 任务详情（TaskDetail），GET /tasks/{taskId} */
export interface TaskDetail extends TaskCard {
  projectId: number;
  description: string | null;
  creator: UserBrief;
  /** 1-5 */
  importance: number;
  /** 1-5 */
  urgency: number;
  /** 计划工期（工作日） */
  planDays: number;
  /** 已用工作日 */
  usedDays: number;
  /** 预估工时（小时） */
  estHours: number;
  requiredSkills: string[];
  /** yyyy-MM-dd */
  planStart: string | null;
  /** yyyy-MM-dd */
  actualStart: string | null;
  parent: TaskRef | null;
  milestone: { id: number; name: string } | null;
  /** 前置任务 */
  predecessors: DependencyTask[];
  /** 后续任务（等它的任务） */
  successors: DependencyTask[];
  subtasks: TaskCard[];
  documents: DocumentBrief[];
  discussions: DiscussionBrief[];
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
  /** yyyy-MM-dd HH:mm:ss */
  updatedAt: string;
}

/**
 * 负责人候选人：项目成员加上他的技能标签
 * - skillTags 来自 User.skillTags（Member 里没有这个字段）
 * - load / capacity 来自 GET /projects/{projectId}/workload 的 loadHours / capacity
 */
export interface AssigneeCandidate {
  user: UserBrief;
  skillTags: string[];
  load: number;
  capacity: number;
}

/** 任务表单的值，对应 TaskCreate / TaskUpdate 里页面能填的字段 */
export interface TaskFormValues {
  title: string;
  description: string;
  milestoneId: number | null;
  assigneeId: number | null;
  /** yyyy-MM-dd */
  planStart: string;
  planDays: number;
  predecessorIds: number[];
}
