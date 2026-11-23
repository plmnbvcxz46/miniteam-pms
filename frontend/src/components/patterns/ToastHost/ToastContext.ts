import { createContext } from "react";
import type { ToastTone } from "../../ui/Toast";

export interface ToastOptions {
  tone?: ToastTone;
  /** 补充说明 */
  description?: string;
  /** 自动关闭时长（毫秒），默认 4000 */
  duration?: number;
}

export type ShowToast = (title: string, options?: ToastOptions) => void;

export const ToastContext = createContext<ShowToast | null>(null);
