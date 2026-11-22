import type { ComponentPropsWithRef } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "solid" | "outline" | "muted" | "accent";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  /**
   * 视觉变体：
   * - solid：墨底反白（完成 / 就绪 / 正常等常态强标识）
   * - outline：墨框暖纸底（常规分类 / 角色标签）
   * - muted：弱化描边 + 次要字（规划中 / 归档 / 次要信息）
   * - accent：信号橙（仅用于逾期、阻塞、关键路径等需注意状态）
   */
  variant?: BadgeVariant;
  /** 尺寸档位：sm | md（默认 md） */
  size?: BadgeSize;
}

export function Badge({
  variant = "outline",
  size = "md",
  className,
  children,
  ref,
  ...rest
}: BadgeProps) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={className ? `${styles.badge} ${className}` : styles.badge}
      {...rest}
    >
      {children}
    </span>
  );
}
