import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../../api/auth";
import { ApiError, getToken, setToken, setUnauthorizedHandler } from "../../api/http";
import type { ProfileUpdate } from "../../shared/types/settings";
import {
  toAccount,
  type Account,
  type AuthField,
  type LoginResult,
  type RegisterRequest,
  type RegisterResult,
} from "../../shared/types/auth";
import { AuthContext, type AuthState } from "./AuthContext";

/** 和后端的校验保持一致：账号 3~32 位，密码 6~64 位，姓名最长 32 */
const USERNAME_RANGE = [3, 32] as const;
const PASSWORD_RANGE = [6, 64] as const;
const REAL_NAME_MAX = 32;

/** 登录失败时，把接口返回的原因对应到出错的输入框 */
function fieldOf(error: ApiError): AuthField {
  if (error.message.includes("停用")) return "username";
  return "password";
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Account | null>(null);
  // 有 token 说明刷新前登录过，先用它恢复身份
  const [loading, setLoading] = useState(() => getToken() !== null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setMe(null);
      setNotice("登录已过期，请重新登录");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (getToken() === null) return;
    let alive = true;
    authApi
      .me()
      .then((current) => alive && setMe(toAccount(current)))
      .catch((error: unknown) => {
        // 401 已由未登录处理清掉了 token；网络不通时保留 token，刷新可以重试
        if (error instanceof ApiError && error.code === 0 && alive) {
          setNotice(error.message);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const name = username.trim();
      if (!name) return { ok: false, field: "username", message: "请输入账号" };
      if (!password) return { ok: false, field: "password", message: "请输入密码" };
      try {
        const result = await authApi.login({ username: name, password });
        setToken(result.token);
        const account = toAccount(result.me);
        setMe(account);
        setNotice("");
        return { ok: true, account };
      } catch (error) {
        if (error instanceof ApiError) {
          return { ok: false, field: fieldOf(error), message: error.message };
        }
        throw error;
      }
    },
    [],
  );

  const register = useCallback(
    async (values: RegisterRequest): Promise<RegisterResult> => {
      const realName = values.realName.trim();
      const username = values.username.trim();
      if (!realName) return { ok: false, field: "realName", message: "请输入姓名" };
      if (realName.length > REAL_NAME_MAX) {
        return { ok: false, field: "realName", message: `姓名最长 ${REAL_NAME_MAX} 个字` };
      }
      if (!username) return { ok: false, field: "username", message: "请输入账号" };
      if (username.length < USERNAME_RANGE[0] || username.length > USERNAME_RANGE[1]) {
        return {
          ok: false,
          field: "username",
          message: `账号要 ${USERNAME_RANGE[0]} 到 ${USERNAME_RANGE[1]} 个字符`,
        };
      }
      if (!values.password) return { ok: false, field: "password", message: "请输入密码" };
      if (values.password.length < PASSWORD_RANGE[0] || values.password.length > PASSWORD_RANGE[1]) {
        return {
          ok: false,
          field: "password",
          message: `密码要 ${PASSWORD_RANGE[0]} 到 ${PASSWORD_RANGE[1]} 位`,
        };
      }
      try {
        await authApi.register({ realName, username, password: values.password });
        setNotice("注册成功，请登录");
        return { ok: true };
      } catch (error) {
        if (error instanceof ApiError) {
          const field: AuthField = error.code === 409 ? "username" : "password";
          return { ok: false, field, message: error.message };
        }
        throw error;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // token 本来就失效或网络不通时，本地照样退出
    }
    setToken(null);
    setMe(null);
    setNotice("已退出登录");
  }, []);

  const updateProfile = useCallback(async (values: ProfileUpdate) => {
    const updated = await authApi.updateMe(values);
    setMe((prev) =>
      prev
        ? {
            ...prev,
            user: { ...prev.user, realName: updated.realName },
            email: updated.email,
            skillTags: updated.skillTags,
          }
        : prev,
    );
  }, []);

  const clearNotice = useCallback(() => setNotice(""), []);

  const value = useMemo<AuthState>(
    () => ({ me, loading, notice, login, register, logout, updateProfile, clearNotice }),
    [me, loading, notice, login, register, logout, updateProfile, clearNotice],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
