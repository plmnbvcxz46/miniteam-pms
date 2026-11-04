/**
 * 请求封装：路径写相对的 /api/...（本地由 Vite 代理，线上由 nginx 转发）。
 * 接口统一返回 { code, message, data }，code 不是 200 时抛 ApiError，message 是写给用户看的原因。
 */

const TOKEN_KEY = "pms.token";

/** 请求失败。code 是接口返回的状态码，0 表示没连上服务器 */
export class ApiError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

/** token 存在当前标签页里，关掉标签页就退出，和之前的登录态一致 */
export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // 浏览器不让用 sessionStorage 时只是刷新后要重新登录
  }
}

let unauthorizedHandler: (() => void) | null = null;

/** 带着 token 的请求被判定为未登录或已过期时调用，由登录状态那边清掉身份 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type Query = Record<string, string | number | boolean | undefined | null>;

function withQuery(path: string, query?: Query): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const text = params.toString();
  return text ? `${path}?${text}` : path;
}

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; query?: Query } = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`/api${withQuery(path, options.query)}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "无法连接服务器，请稍后再试");
  }

  let payload: { code?: number; message?: string; data?: T } | null = null;
  try {
    payload = await response.json();
  } catch {
    // 不是 JSON（例如网关报错页），下面按 HTTP 状态处理
  }
  const code = payload?.code ?? response.status;
  if (!response.ok || code !== 200) {
    // 只有带着 token 的请求才算“登录过期”，登录接口自己的 401 不触发
    if (code === 401 && token) unauthorizedHandler?.();
    throw new ApiError(code, payload?.message || "请求失败，请稍后再试");
  }
  return payload?.data as T;
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
