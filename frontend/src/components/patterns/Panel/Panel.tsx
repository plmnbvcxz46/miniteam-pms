import type { ReactNode } from "react";
import styles from "./Panel.module.css";

export type PanelVariant = "default" | "flat" | "dark";

export interface PanelProps {
  /** 面板视觉变体：default（暖纸带内边距）| flat（无内边距）| dark（反色墨底） */
  variant?: PanelVariant;
  /** 可选上方小标（如 // TODAY） */
  kicker?: ReactNode;
  /** 可选中文主标题 */
  title?: ReactNode;
  /** 可选头部右侧操作或计数区域 */
  headerRight?: ReactNode;
  /** 内容区是否开启纵向内联滚动 */
  scrollable?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({
  variant = "default",
  kicker,
  title,
  headerRight,
  scrollable = false,
  className,
  children,
}: PanelProps) {
  const hasHeader = kicker != null || title != null || headerRight != null;

  return (
    <section
      data-variant={variant}
      data-scrollable={scrollable ? "true" : undefined}
      className={className ? `${styles.panel} ${className}` : styles.panel}
    >
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {kicker != null && <span className={styles.kicker}>{kicker}</span>}
            {title != null && <h2 className={styles.title}>{title}</h2>}
          </div>
          {headerRight != null && (
            <div className={styles.headerRight}>{headerRight}</div>
          )}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
