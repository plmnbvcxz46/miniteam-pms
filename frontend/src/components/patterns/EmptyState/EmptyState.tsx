import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export type EmptyStateVariant = "default" | "dashed" | "compact";

export interface EmptyStateProps {
  /** 可选空状态标题 */
  title?: ReactNode;
  /** 空状态说明文本 */
  description: ReactNode;
  /** 可选引导操作区 */
  action?: ReactNode;
  /** 外观变体：default（常规段落）| dashed（虚线占位框）| compact（列表内紧凑提示） */
  variant?: EmptyStateVariant;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      data-variant={variant}
      className={className ? `${styles.empty} ${className}` : styles.empty}
    >
      {title != null && <div className={styles.title}>{title}</div>}
      <p className={styles.description}>{description}</p>
      {action != null && <div className={styles.action}>{action}</div>}
    </div>
  );
}
