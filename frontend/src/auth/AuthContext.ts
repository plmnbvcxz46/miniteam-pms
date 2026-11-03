import { createContext } from "react";
import type {
  Account,
  LoginResult,
  RegisterRequest,
  RegisterResult,
} from "../types/auth";

export interface AuthState {
  /** 当前登录的身份，没登录为 null */
  me: Account | null;
  /** 所有账号，账号切换浮层用 */
  accounts: Account[];
  /** 登录页顶部的一次性提示，例如“已退出登录”，操作后会清掉 */
  notice: string;
  /** POST /auth/login，成功后记住身份 */
  login: (username: string, password: string) => LoginResult;
  /** POST /auth/register，注册后角色是普通成员，不自动登录 */
  register: (values: RegisterRequest) => RegisterResult;
  /** POST /auth/logout */
  logout: () => void;
  /** 切换到另一个账号（演示用，不需要密码） */
  switchAccount: (userId: number) => void;
  /** 清掉登录页顶部的提示 */
  clearNotice: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
