import { createContext } from "react";

/**
 * 系统参数（GET /configs、PUT /configs/{key}），按 key 存成字符串。
 * 系统管理里保存后，用到参数的地方（例如任务优先级得分）马上跟着变
 */
export interface ConfigState {
  values: Record<string, string>;
  /** 保存修改后的参数 */
  save: (values: Record<string, string>) => void;
}

export const ConfigContext = createContext<ConfigState | null>(null);
