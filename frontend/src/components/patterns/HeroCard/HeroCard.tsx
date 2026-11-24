import type { ReactNode } from "react";
import styles from "./HeroCard.module.css";

export type HeroCardTone = "alert" | "calm" | "surface";

export interface HeroCardProps {
  /** 强调卡底色语气：alert（信号橙）| calm（反色墨底）| surface（暖纸底） */
  tone?: HeroCardTone;
  /** 可选左上角等宽小标（如 // FORECAST） */
  kicker?: ReactNode;
  /** 可选标题 */
  title?: ReactNode;
  /** 可选右上角徽标或状态标签 */
  badge?: ReactNode;
  /** 可选底部摘要区 */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function HeroCard({
  tone = "alert",
  kicker,
  title,
  badge,
  footer,
  className,
  children,
}: HeroCardProps) {
  const hasHeader = kicker != null || title != null || badge != null;
  const hasHeading = kicker != null || title != null;

  return (
    <section
      data-tone={tone}
      className={className ? `${styles.card} ${className}` : styles.card}
    >
      {hasHeader && (
        <header className={styles.header}>
          {hasHeading && (
            <div className={styles.heading}>
              {kicker != null && <span className={styles.kicker}>{kicker}</span>}
              {title != null && <h2 className={styles.title}>{title}</h2>}
            </div>
          )}
          {badge != null && <div className={styles.badge}>{badge}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
      {footer != null && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
