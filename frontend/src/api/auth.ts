import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";
import type { ProfileUpdate, SystemUser } from "../types/settings";
import { http } from "./http";

export const authApi = {
  login: (body: LoginRequest) => http.post<LoginResponse>("/auth/login", body),
  register: (body: RegisterRequest) => http.post<SystemUser>("/auth/register", body),
  logout: () => http.post<void>("/auth/logout"),
  me: () => http.get<CurrentUser>("/auth/me"),
  updateMe: (body: ProfileUpdate) => http.put<SystemUser>("/auth/me", body),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    http.put<void>("/auth/password", body),
};
