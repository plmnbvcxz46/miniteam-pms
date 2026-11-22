import styles from "./BrandMark.module.css";

export type BrandMarkSize = "sm" | "md";
export type BrandMarkTone = "default" | "inverse";

export interface BrandMarkProps {
  /** 图标尺寸：sm（22×22，侧栏切换器）| md（28×28，页头，默认） */
  size?: BrandMarkSize;
  /** 底色语义：default（浅底墨色）| inverse（深底反白） */
  tone?: BrandMarkTone;
  /** 是否显示 MINITEAM PMS 品牌字标 */
  showWordmark?: boolean;
  /** 仅限外部布局定位类（如宽/边距/显隐控制） */
  className?: string;
}

export function BrandMark({
  size = "md",
  tone = "default",
  showWordmark = false,
  className,
}: BrandMarkProps) {
  return (
    <span
      data-size={size}
      data-tone={tone}
      className={className ? `${styles.brand} ${className}` : styles.brand}
    >
      <svg className={styles.mark} viewBox="0 0 34 34" aria-hidden="true">
        <rect x="0" y="0" width="15" height="34" className={styles.primary} />
        <rect x="19" y="0" width="15" height="18" className={styles.accent} />
      </svg>
      {showWordmark && "MINITEAM PMS"}
    </span>
  );
}
