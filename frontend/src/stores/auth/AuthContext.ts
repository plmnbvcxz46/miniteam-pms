import { createContext } from "react";
import type { ProfileUpdate } from "../../shared/types/settings";
import type {
  Account,
  LoginResult,
  RegisterRequest,
  RegisterResult,
} from "../../shared/types/auth";

export interface AuthState {
  /** 当前登录的身份，没登录为 null */
  me: Account | null;
  /** 刷新页面后正在用 token 恢复登录，期间不该显示登录页 */
  loading: boolean;
  /** 登录页顶部的一次性提示，例如“已退出登录”，操作后会清掉 */
  notice: string;
  /** POST /auth/login，成功后记住身份 */
  login: (username: string, password: string) => Promise<LoginResult>;
  /** POST /auth/register，注册后角色是普通用户，不自动登录 */
  register: (values: RegisterRequest) => Promise<RegisterResult>;
  /** POST /auth/logout */
  logout: () => Promise<void>;
  /** PUT /auth/me，失败时抛 ApiError */
  updateProfile: (values: ProfileUpdate) => Promise<void>;
  /** 清掉登录页顶部的提示 */
  clearNotice: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
