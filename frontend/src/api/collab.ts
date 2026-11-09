import type {
  Comment,
  CommentCreate,
  DiscussionBrief,
  DiscussionCreate,
  DiscussionDetail,
} from "../shared/types/collab";
import type { Activity, Notification } from "../shared/types/global";
import { http } from "./http";

export const collabApi = {
  /** 项目里的讨论，最近有回复的在前；taskId 只取这个任务的 */
  listDiscussions: (projectId: number, taskId?: number) =>
    http.get<DiscussionBrief[]>(`/projects/${projectId}/discussions`, { taskId }),
  getDiscussion: (discussionId: number) =>
    http.get<DiscussionDetail>(`/discussions/${discussionId}`),
  /** 发起讨论，同时写下第一条评论 */
  createDiscussion: (projectId: number, body: DiscussionCreate) =>
    http.post<DiscussionDetail>(`/projects/${projectId}/discussions`, body),
  createComment: (discussionId: number, body: CommentCreate) =>
    http.post<Comment>(`/discussions/${discussionId}/comments`, body),
  /** 项目动态，新的在前，一次最多 100 条 */
  listActivities: (projectId: number, limit = 100) =>
    http.get<Activity[]>(`/projects/${projectId}/activities`, { limit }),
};

export const notificationApi = {
  list: (query: { unreadOnly?: boolean; page?: number; size?: number } = {}) =>
    http.get<{ total: number; list: Notification[] }>("/notifications", query),
  unreadCount: () => http.get<number>("/notifications/unread-count"),
  markRead: (notificationId: number) => http.put<void>(`/notifications/${notificationId}/read`),
  markAllRead: () => http.put<void>("/notifications/read-all"),
};
