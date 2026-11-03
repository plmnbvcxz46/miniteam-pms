import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/useAuth";
import type { AuthField } from "../../types/auth";
import "./css/login.css";

const REMEMBER_KEY = "pms.rememberedUsername";

function readRemembered(): string {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeRemembered(username: string | null) {
  try {
    if (username) localStorage.setItem(REMEMBER_KEY, username);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // 浏览器不让用 localStorage 时只是不记账号
  }
}

export default function LoginPage() {
  const { login, register, notice, clearNotice } = useAuth();
  const remembered = readRemembered();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState(remembered);
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  // 第一次来默认勾选，之后跟随上次有没有记住账号
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ field: AuthField; message: string } | null>(
    null,
  );
  const inputs = useRef<Partial<Record<AuthField, HTMLInputElement | null>>>({});

  const isRegister = mode === "register";

  const fail = (field: AuthField, message: string) => {
    setError({ field, message });
    const input = inputs.current[field];
    input?.focus();
    input?.select();
  };

  const edit = (setter: (v: string) => void, field: AuthField) => (v: string) => {
    setter(v);
    if (error?.field === field) setError(null);
    clearNotice();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await register({ realName, username, password });
        if (!result.ok) return fail(result.field, result.message);
        // 注册成功：回到登录，账号预填，焦点放到密码
        setMode("login");
        setPassword("");
        setError(null);
        setTimeout(() => inputs.current.password?.focus(), 0);
        return;
      }
      const result = await login(username, password);
      if (!result.ok) return fail(result.field, result.message);
      writeRemembered(remember ? username.trim() : null);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
    setPassword("");
    clearNotice();
  };

  const errorProps = (field: AuthField) =>
    error?.field === field
      ? { "aria-invalid": true as const, "aria-describedby": `auth-err-${field}` }
      : {};
  const errorText = (field: AuthField) =>
    error?.field === field && (
      <div className="err" id={`auth-err-${field}`} role="alert">
        {error.message}
      </div>
    );

  return (
    <main className="auth">
      <div className="auth-col">
        <div className="auth-brand">
          <svg width="28" height="28" viewBox="0 0 34 34" aria-hidden="true">
            <rect x="0" y="0" width="15" height="34" fill="#0a0a0a" />
            <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
          </svg>
          MINITEAM PMS
        </div>

        <div className="vh">
          <div className="vl">
            <div className="k">{isRegister ? "SIGN UP" : "SIGN IN"}</div>
            <h1 className="vt">{isRegister ? "注册" : "登录"}</h1>
            <span className="vd">小型软件团队项目管理系统</span>
          </div>
        </div>

        <form className="pnl auth-form" noValidate onSubmit={handleSubmit}>
          {notice && (
            <p className="auth-note" role="status">
              {notice}
            </p>
          )}

          {isRegister && (
            <div className="fr">
              <label htmlFor="auth-name">姓名</label>
              <div>
                <input
                  className="u"
                  id="auth-name"
                  autoFocus
                  autoComplete="name"
                  placeholder="真实姓名"
                  ref={(el) => {
                    inputs.current.realName = el;
                  }}
                  value={realName}
                  onChange={(e) => edit(setRealName, "realName")(e.target.value)}
                  {...errorProps("realName")}
                />
              </div>
              {errorText("realName")}
            </div>
          )}

          <div className="fr">
            <label htmlFor="auth-username">账号</label>
            <div>
              <input
                className="u mono"
                id="auth-username"
                autoFocus={!isRegister && !remembered}
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="账号"
                ref={(el) => {
                  inputs.current.username = el;
                }}
                value={username}
                onChange={(e) => edit(setUsername, "username")(e.target.value)}
                {...errorProps("username")}
              />
            </div>
            {errorText("username")}
          </div>

          <div className="fr">
            <label htmlFor="auth-password">密码</label>
            <div>
              <input
                className="u"
                id="auth-password"
                type="password"
                autoFocus={!isRegister && !!remembered}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="密码"
                ref={(el) => {
                  inputs.current.password = el;
                }}
                value={password}
                onChange={(e) => edit(setPassword, "password")(e.target.value)}
                {...errorProps("password")}
              />
            </div>
            {errorText("password")}
          </div>

          {!isRegister && (
            <label className="ck auth-opts">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              记住账号
            </label>
          )}

          <button className="btn go auth-submit" type="submit" disabled={submitting}>
            {isRegister ? "注册" : "登录"}
          </button>
          <p className="auth-alt">
            {isRegister ? "已有账号？" : "没有账号？"}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "登录" : "注册"}
            </button>
          </p>
        </form>

      </div>
    </main>
  );
}
