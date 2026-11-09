import { createContext } from "react";
import type { ConfigItem } from "../../shared/types/settings";

/**
 * 系统参数（GET /configs、PUT /configs/{key}），只用接口返回的数据，没有前端默认值。
 * 系统管理里保存后，用到参数的地方马上跟着变
 */
export interface ConfigState {
  /** 接口返回的参数，带名称和备注 */
  items: ConfigItem[];
  /** 按 key 取值 */
  values: Record<string, string>;
  /** 读取状态：没登录或还没返回时是 loading */
  status: "loading" | "ready" | "error";
  /** 读取失败的原因 */
  error: string;
  /** 保存修改后的参数：只提交有变化的项，失败时抛 ApiError */
  save: (values: Record<string, string>) => Promise<void>;
}

export const ConfigContext = createContext<ConfigState | null>(null);
