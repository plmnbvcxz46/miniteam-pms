import type { ReactNode } from "react";
import styles from "./MetricStrip.module.css";

export interface MetricStripItem {
  key?: string;
  label: string;
  value: number | string;
  /** 紧跟数值的弱化小字，如 /18、工作日、项 */
  unit?: string;
  /** 可选右下角补充说明 */
  sub?: string;
  /** default 常态（首格自动反色）| alert 顶部信号橙条 + 告警色 */
  tone?: "default" | "alert";
  /** 可选右上角徽标（如 风险） */
  badge?: ReactNode;
}

export interface MetricStripProps {
  items: readonly MetricStripItem[];
  className?: string;
}

/** 4 格 KPI 指标条：首格反白、--font-size-figure 大号数字、支持 unit/sub/alert/badge */
export function MetricStrip({ items, className }: MetricStripProps) {
  return (
    <div className={className ? `${styles.strip} ${className}` : styles.strip}>
      {items.map((item, idx) => (
        <div
          key={item.key ?? `${item.label}-${idx}`}
          className={styles.cell}
          data-tone={item.tone === "alert" ? "alert" : undefined}
        >
          <div className={styles.top}>
            <span className={styles.label}>// {item.label}</span>
            {item.badge != null && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </div>
          <div className={styles.bottom}>
            <div className={styles.valueGroup}>
              <span className={styles.value}>{item.value}</span>
              {item.unit && <small className={styles.unit}>{item.unit}</small>}
            </div>
            {item.sub && <span className={styles.sub}>{item.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
