import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../../stores/auth/useAuth";
import type { AuthField } from "../../../shared/types/auth";

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
    // 浏览器禁用 localStorage 时降级为仅本次会话有效
  }
}

export interface AuthFormError {
  field: AuthField;
  message: string;
}

export function useAuthForm() {
  const { login, register, notice, clearNotice } = useAuth();
  const [hasRemembered] = useState(() => Boolean(readRemembered()));
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState(() => readRemembered());
  const [password, setPassword] = useState("");
  const [realName, setRealName] = useState("");
  // 首次访问默认勾选记住账号，提交时按当前勾选状态写入或清除
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthFormError | null>(null);
  const inputs = useRef<Partial<Record<AuthField, HTMLInputElement | null>>>({});

  const isRegister = mode === "register";

  const fail = (field: AuthField, message: string) => {
    setError({ field, message });
    const input = inputs.current[field];
    input?.focus();
    input?.select();
  };

  const handleFieldChange = (field: AuthField, value: string) => {
    if (field === "realName") setRealName(value);
    else if (field === "username") setUsername(value);
    else setPassword(value);
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
        // 注册成功后切回登录模式、保留账号并将焦点移至密码框
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

  const setInputRef = (field: AuthField) => (el: HTMLInputElement | null) => {
    inputs.current[field] = el;
  };

  const fieldError = (field: AuthField) =>
    error?.field === field ? error.message : undefined;

  return {
    mode,
    isRegister,
    hasRemembered,
    realName,
    username,
    password,
    remember,
    submitting,
    notice,
    setRemember,
    handleFieldChange,
    handleSubmit,
    switchMode,
    setInputRef,
    fieldError,
  };
}

export type AuthFormState = ReturnType<typeof useAuthForm>;
