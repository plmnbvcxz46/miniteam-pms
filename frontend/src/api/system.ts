import type {
  ConfigItem,
  LogItem,
  Role,
  SystemUser,
  UserCreate,
  UserUpdate,
} from "../shared/types/settings";
import type { PageResult, UserBrief } from "../shared/types/global";
import { http } from "./http";

export const userApi = {
  /** 邀请成员时搜人：任何登录用户可用，只搜启用的账号 */
  search: (keyword: string, limit = 10) =>
    http.get<UserBrief[]>("/users/search", { keyword, limit }),
  list: (query: { keyword?: string; page?: number; size?: number } = {}) =>
    http.get<PageResult<SystemUser>>("/users", query),
  create: (body: UserCreate) => http.post<SystemUser>("/users", body),
  update: (id: number, body: UserUpdate) => http.put<SystemUser>(`/users/${id}`, body),
  remove: (id: number) => http.delete<void>(`/users/${id}`),
  setStatus: (id: number, status: 0 | 1) =>
    http.put<void>(`/users/${id}/status`, { status }),
  resetPassword: (id: number) =>
    http.post<{ password: string }>(`/users/${id}/reset-password`),
};

export const roleApi = {
  list: () => http.get<Role[]>("/roles"),
};

export const configApi = {
  list: () => http.get<ConfigItem[]>("/configs"),
  update: (key: string, value: string) =>
    http.put<ConfigItem>(`/configs/${encodeURIComponent(key)}`, { value }),
};

export const logApi = {
  list: (query: { page?: number; size?: number } = {}) =>
    http.get<PageResult<LogItem>>("/logs", query),
};
