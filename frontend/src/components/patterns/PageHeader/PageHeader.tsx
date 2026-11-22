import type { ReactNode } from "react";
import { Separator } from "../../ui/Separator";
import styles from "./PageHeader.module.css";

export type PageHeaderSize = "default" | "compact";

export interface PageHeaderProps {
  /** 外层语义容器标签：默认 header，在已有 <header> 内部嵌套时传 div */
  as?: "header" | "div";
  /** 刊头上标（默认自动包裹 [ ... ]） */
  kicker?: ReactNode;
  /** 为 true 时不自动添加 [ ] 包裹 */
  kickerRaw?: boolean;
  /** 可选面包屑/返回条（用于详情页等） */
  breadcrumb?: ReactNode;
  /** 主标题前半段 */
  title: ReactNode;
  /** 主标题信号橙强调部分 */
  accentTitle?: ReactNode;
  /** 可选副标题 */
  subtitle?: ReactNode;
  /** 标题字号档位：default（60px，窄屏降 44px）| compact（恒定 44px） */
  size?: PageHeaderSize;
  /** 右侧操作区 */
  actions?: ReactNode;
  /** 是否在底部显示报刊粗细双横线（默认 true） */
  showRule?: boolean;
  className?: string;
}

export function PageHeader({
  as = "header",
  kicker,
  kickerRaw = false,
  breadcrumb,
  title,
  accentTitle,
  subtitle,
  size = "default",
  actions,
  showRule = true,
  className,
}: PageHeaderProps) {
  const Tag = as;

  return (
    <Tag
      data-size={size}
      className={className ? `${styles.pageHeader} ${className}` : styles.pageHeader}
    >
      <div className={styles.row}>
        <div className={styles.main}>
          {breadcrumb != null && (
            <div className={styles.breadcrumb}>{breadcrumb}</div>
          )}
          {kicker != null && (
            <div
              className={styles.kicker}
              data-raw={kickerRaw ? "true" : undefined}
            >
              {kicker}
            </div>
          )}
          <h1 className={styles.title}>
            {title}
            {accentTitle != null && (
              <em className={styles.accent}>{accentTitle}</em>
            )}
          </h1>
          {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions != null && <div className={styles.actions}>{actions}</div>}
      </div>
      {showRule && <Separator variant="masthead" />}
    </Tag>
  );
}
