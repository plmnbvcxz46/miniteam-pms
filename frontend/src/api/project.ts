import type {
  Activity,
  IssueSummary,
  MemberPermissions,
  Project,
  ProjectSave,
  ProjectStatus,
  ProjectSummary,
} from "../shared/types/global";
import type { Member, MemberAdd, MemberUpdate } from "../shared/types/members";
import type { IssueSnapshot } from "../shared/types/progress";
import { http } from "./http";

export const projectApi = {
  list: (status?: ProjectStatus) => http.get<ProjectSummary[]>("/projects", { status }),
  create: (body: ProjectSave) => http.post<Project>("/projects", body),
  get: (id: number) => http.get<Project>(`/projects/${id}`),
  update: (id: number, body: ProjectSave) => http.put<Project>(`/projects/${id}`, body),
  archive: (id: number) => http.post<void>(`/projects/${id}/archive`),
  issues: (id: number) => http.get<IssueSummary[]>(`/projects/${id}/issues`),
  /** 某一期的快照；过去的期没有存档时 404“这一期没有存档” */
  issue: (id: number, issueDate: string) =>
    http.get<IssueSnapshot>(`/projects/${id}/issues/${issueDate}`),
};

export const memberApi = {
  list: (projectId: number) => http.get<Member[]>(`/projects/${projectId}/members`),
  add: (projectId: number, body: MemberAdd) =>
    http.post<Member>(`/projects/${projectId}/members`, body),
  update: (projectId: number, userId: number, body: MemberUpdate) =>
    http.put<Member>(`/projects/${projectId}/members/${userId}`, body),
  updatePermissions: (projectId: number, userId: number, body: MemberPermissions) =>
    http.put<Member>(`/projects/${projectId}/members/${userId}/permissions`, body),
};

export const activityApi = {
  list: (
    projectId: number,
    query: { targetType?: string; targetId?: number; before?: number; limit?: number } = {},
  ) => http.get<Activity[]>(`/projects/${projectId}/activities`, query),
};
