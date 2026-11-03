import { useCallback, useMemo, useState, type ReactNode } from "react";
import { accounts as initialAccounts } from "../data/auth";
import type {
  Account,
  LoginResult,
  RegisterRequest,
  RegisterResult,
} from "../types/auth";
import { AuthContext, type AuthState } from "./AuthContext";

const SESSION_KEY = "pms.session";

/** 刷新页面后保持登录：只记用户 id，存在当前标签页里，关掉标签页就退出 */
function readSession(): number | null {
  try {
    const id = Number(sessionStorage.getItem(SESSION_KEY));
    return id || null;
  } catch {
    return null;
  }
}

function writeSession(id: number | null) {
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, String(id));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // 浏览器不让用 sessionStorage 时只是刷新后要重新登录
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [meId, setMeId] = useState<number | null>(readSession);
  const [notice, setNotice] = useState("");
  const me = accounts.find((a) => a.user.id === meId) ?? null;

  const login = useCallback(
    (username: string, password: string): LoginResult => {
      const name = username.trim();
      if (!name) return { ok: false, field: "username", message: "请输入账号" };
      const account = accounts.find((a) => a.user.username === name);
      if (!account) return { ok: false, field: "username", message: "账号不存在" };
      if (account.disabled) {
        return { ok: false, field: "username", message: "账号已停用，请联系管理员" };
      }
      // 假数据阶段不校验密码内容，接口接通后由后端判断“密码错误”
      if (!password) return { ok: false, field: "password", message: "请输入密码" };
      setMeId(account.user.id);
      writeSession(account.user.id);
      setNotice("");
      return { ok: true, account };
    },
    [accounts],
  );

  const register = useCallback(
    (values: RegisterRequest): RegisterResult => {
      const realName = values.realName.trim();
      const username = values.username.trim();
      if (!realName) return { ok: false, field: "realName", message: "请输入姓名" };
      if (!username) return { ok: false, field: "username", message: "请输入账号" };
      if (accounts.some((a) => a.user.username === username)) {
        return { ok: false, field: "username", message: "账号已存在" };
      }
      if (!values.password) return { ok: false, field: "password", message: "请输入密码" };
      const id = Math.max(0, ...accounts.map((a) => a.user.id)) + 1;
      // 注册后是普通成员：没加入项目，权限全部为否
      const account: Account = {
        user: { id, username, realName },
        roleName: "普通成员",
        disabled: false,
        systemPermissions: [],
        projectRole: null,
        permissions: {
          canEditTask: false,
          canEditSchedule: false,
          canEditDoc: false,
          canManageMember: false,
        },
      };
      setAccounts((prev) => [...prev, account]);
      setNotice("注册成功，请登录");
      return { ok: true };
    },
    [accounts],
  );

  const logout = useCallback(() => {
    setMeId(null);
    writeSession(null);
    setNotice("已退出登录");
  }, []);

  const switchAccount = useCallback(
    (userId: number) => {
      const account = accounts.find((a) => a.user.id === userId);
      if (!account || account.disabled) return;
      setMeId(userId);
      writeSession(userId);
    },
    [accounts],
  );

  const clearNotice = useCallback(() => setNotice(""), []);

  const value = useMemo<AuthState>(
    () => ({ me, accounts, notice, login, register, logout, switchAccount, clearNotice }),
    [me, accounts, notice, login, register, logout, switchAccount, clearNotice],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
