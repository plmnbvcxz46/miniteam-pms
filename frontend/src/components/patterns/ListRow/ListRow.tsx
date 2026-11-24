import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./ListRow.module.css";

export type ListRowDensity = "compact" | "comfortable";
export type ListRowTone = "default" | "alert";

export interface ListRowProps {
  /** 提供时渲染为路由 Link */
  to?: string;
  /** 无 to 且提供 onClick 时渲染为原生 <button type="button"> */
  onClick?: () => void;
  density?: ListRowDensity;
  tone?: ListRowTone;
  selected?: boolean;
  leading?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  accessibleTitle?: string;
  className?: string;
}

export function ListRow({
  to,
  onClick,
  density = "compact",
  tone = "default",
  selected = false,
  leading,
  title,
  meta,
  trailing,
  accessibleTitle,
  className,
}: ListRowProps) {
  const interactive = to != null || onClick != null;
  const cls = className ? `${styles.row} ${className}` : styles.row;

  const content = (
    <>
      {leading != null && <span className={styles.leading}>{leading}</span>}
      <span className={styles.main}>
        <span className={styles.title}>{title}</span>
        {meta != null && <span className={styles.meta}>{meta}</span>}
      </span>
      {trailing != null && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  const dataAttrs = {
    "data-density": density,
    "data-tone": tone,
    "data-interactive": interactive ? "true" : undefined,
    "data-selected": selected ? "true" : undefined,
  };

  if (to != null) {
    return (
      <Link to={to} title={accessibleTitle} className={cls} {...dataAttrs}>
        {content}
      </Link>
    );
  }

  if (onClick != null) {
    return (
      <button
        type="button"
        title={accessibleTitle}
        onClick={onClick}
        className={cls}
        {...dataAttrs}
      >
        {content}
      </button>
    );
  }

  return (
    <div title={accessibleTitle} className={cls} {...dataAttrs}>
      {content}
    </div>
  );
}
