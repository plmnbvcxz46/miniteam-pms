import type { ComponentPropsWithRef, ReactNode } from "react";
import { Toast as RadixToast } from "radix-ui";
import styles from "./Toast.module.css";

export type ToastTone = "neutral" | "danger";

export interface ToastItem {
  /** 队列项唯一标识 */
  id: string;
  /** 语义语气：neutral（常规回执，墨黑）| danger（操作拦截/报错，信号橙） */
  tone?: ToastTone;
  /** 提示标题 */
  title: ReactNode;
  /** 可选补充说明 */
  description?: ReactNode;
  /** 可选行内操作槽 */
  action?: ReactNode;
  /** 独立自动关闭时长（毫秒，默认 4000） */
  duration?: number;
}

export const ToastProvider = RadixToast.Provider;

export type ToastViewportProps = ComponentPropsWithRef<
  typeof RadixToast.Viewport
>;

export function ToastViewport({
  className,
  ref,
  ...rest
}: ToastViewportProps) {
  return (
    <RadixToast.Viewport
      ref={ref}
      className={
        className ? `${styles.viewport} ${className}` : styles.viewport
      }
      {...rest}
    />
  );
}

export interface ToastProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixToast.Root>,
    "title" | "asChild" | "children"
  > {
  /** 语义语气：neutral（常规回执，墨黑）| danger（操作拦截/报错，信号橙） */
  tone?: ToastTone;
  /** 提示标题 */
  title: ReactNode;
  /** 可选补充说明 */
  description?: ReactNode;
  /** 可选行内操作槽（如撤销按钮） */
  action?: ReactNode;
}

export function Toast({
  tone = "neutral",
  title,
  description,
  action,
  duration = 4000,
  className,
  ref,
  ...rest
}: ToastProps) {
  return (
    <RadixToast.Root
      ref={ref}
      duration={duration}
      type={tone === "danger" ? "foreground" : "background"}
      role={tone === "danger" ? "alert" : "status"}
      data-tone={tone}
      className={className ? `${styles.toast} ${className}` : styles.toast}
      {...rest}
    >
      <div className={styles.body}>
        <RadixToast.Title className={styles.title}>{title}</RadixToast.Title>
        {description != null && (
          <RadixToast.Description className={styles.description}>
            {description}
          </RadixToast.Description>
        )}
      </div>

      {action != null && <div className={styles.action}>{action}</div>}

      <RadixToast.Close className={styles.close} aria-label="关闭通知">
        ×
      </RadixToast.Close>
    </RadixToast.Root>
  );
}
