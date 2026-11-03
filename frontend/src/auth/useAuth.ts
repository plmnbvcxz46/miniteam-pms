import { useContext } from "react";
import type { Account } from "../types/auth";
import { AuthContext, type AuthState } from "./AuthContext";

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth 要放在 AuthProvider 里面");
  return state;
}

/** 已登录后才会渲染的组件用：拿到非空的当前身份 */
export function useMe(): Account {
  const { me } = useAuth();
  if (!me) throw new Error("还没有登录");
  return me;
}
