import type { ComponentPropsWithRef, ReactNode } from "react";
import { Spinner } from "../Spinner";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "default"
  | "primary"
  | "accent"
  | "danger"
  | "dashed"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /** 视觉变体：默认 default（暖纸黑框） */
  variant?: ButtonVariant;
  /** 尺寸档位：默认 md（34px） */
  size?: ButtonSize;
  /** 加载中：禁用点击、显示居中指示环并保持按钮宽高零抖动 */
  loading?: boolean;
  /** 可选前置图标 */
  leadingIcon?: ReactNode;
  /** 可选后置图标 */
  trailingIcon?: ReactNode;
  /** 是否撑满父容器宽度 */
  fullWidth?: boolean;
}

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  type = "button",
  disabled = false,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      className={className ? `${styles.button} ${className}` : styles.button}
      {...rest}
    >
      <span className={styles.content}>
        {leadingIcon != null && (
          <span className={styles.icon} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {children}
        {trailingIcon != null && (
          <span className={styles.icon} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </span>
      {loading && (
        <span className={styles.spinnerSlot} aria-hidden="true">
          <Spinner size={size === "sm" ? "sm" : "md"} />
        </span>
      )}
    </button>
  );
}
