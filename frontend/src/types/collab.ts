/**
 * 团队协作模块类型定义（对齐 docs/api/openapi.yaml 的“团队协作”标签）
 * 共享结构（UserBrief、TaskRef、TaskStatus、Activity、IssueInfo 等）见 ./global
 */
import type {
  Activity,
  IssueInfo,
  TaskRef,
  TaskStatus,
  UserBrief,
} from "./global";

/** 讨论列表项（DiscussionBrief），GET /projects/{projectId}/discussions 的数组元素 */
export interface DiscussionBrief {
  id: number;
  title: string;
  task: TaskRef | null;
  commentCount: number;
  /** 最后回复时间 yyyy-MM-dd HH:mm:ss，无回复时为空 */
  lastCommentAt: string | null;
}

/** 讨论评论（Comment），DiscussionDetail.comments 数组元素及 POST /discussions/{discussionId}/comments 返回值 */
export interface Comment {
  id: number;
  user: UserBrief;
  content: string;
  mentions: UserBrief[];
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
}

/** 讨论详情关联任务信息（对齐 DiscussionDetail.task 内联对象） */
export interface DiscussionTask extends TaskRef {
  status: TaskStatus;
  overdueDays: number;
}

/** 讨论详情与评论列表（DiscussionDetail），GET /discussions/{discussionId} */
export interface DiscussionDetail {
  id: number;
  title: string;
  creator: UserBrief;
  /** yyyy-MM-dd HH:mm:ss */
  createdAt: string;
  task: DiscussionTask | null;
  comments: Comment[];
}

/** 发起讨论请求体（DiscussionCreate），POST /projects/{projectId}/discussions */
export interface DiscussionCreate {
  title: string;
  taskId?: number;
  /** 第一条评论 */
  content: string;
}

/** 发表回复请求体（CommentCreate），POST /discussions/{discussionId}/comments */
export interface CommentCreate {
  content: string;
  /** @ 的用户 ID 列表 */
  mentionIds?: number[];
}

/** 团队协作页快照（预留往期切换使用） */
export interface CollabSnapshot extends IssueInfo {
  discussions: DiscussionBrief[];
  discussionDetails: Record<number, DiscussionDetail>;
  activities: Activity[];
}
