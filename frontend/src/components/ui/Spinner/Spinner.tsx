import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  /** 尺寸档位：sm(12px) / md(14px) / lg(20px)，默认 md */
  size?: SpinnerSize;
  /** 可选无障碍播报文案；不传时视为纯装饰元素（aria-hidden） */
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const ringClass = className ? `${styles.ring} ${className}` : styles.ring;

  if (label) {
    return (
      <span className={styles.wrapper} role="status">
        <span className={ringClass} data-size={size} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return <span className={ringClass} data-size={size} aria-hidden="true" />;
}
