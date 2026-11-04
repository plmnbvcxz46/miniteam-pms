import type { CriticalPath, Gantt, Overview, PriorityItem, TodoItem } from "../types/progress";
import { http } from "./http";

export const progressApi = {
  gantt: (projectId: number) => http.get<Gantt>(`/projects/${projectId}/gantt`),
  criticalPath: (projectId: number) =>
    http.get<CriticalPath>(`/projects/${projectId}/critical-path`),
  overview: (projectId: number) => http.get<Overview>(`/projects/${projectId}/overview`),
  /** 当前用户的今日待办；limit 为空取系统参数 priority.top_n */
  todo: (projectId: number, limit?: number) =>
    http.get<TodoItem[]>(`/projects/${projectId}/todo`, { limit }),
  priorityRanking: (projectId: number) =>
    http.get<PriorityItem[]>(`/projects/${projectId}/priority-ranking`),
};
