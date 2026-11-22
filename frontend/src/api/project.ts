import type { Activity, MemberPermissions } from "../shared/types/global";
import type { Member, MemberAdd, MemberUpdate } from "../shared/types/members";
import { http } from "./http";

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
