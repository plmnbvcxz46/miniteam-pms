import type {
  IssueSummary,
  Project,
  ProjectSave,
  ProjectStatus,
  ProjectSummary,
} from "../shared/types/global";
import type { IssueSnapshot } from "../shared/types/progress";
import { http } from "../api/http";

export const projectApi = {
  list: (status?: ProjectStatus) =>
    http.get<ProjectSummary[]>("/projects", { status }),
  create: (body: ProjectSave) => http.post<Project>("/projects", body),
  get: (id: number) => http.get<Project>(`/projects/${id}`),
  update: (id: number, body: ProjectSave) =>
    http.put<Project>(`/projects/${id}`, body),
  archive: (id: number) => http.post<void>(`/projects/${id}/archive`),
  issues: (id: number) => http.get<IssueSummary[]>(`/projects/${id}/issues`),
  /** 某一期的快照；过去的期没有存档时 404“这一期没有存档” */
  issue: (id: number, issueDate: string) =>
    http.get<IssueSnapshot>(`/projects/${id}/issues/${issueDate}`),
};
