import type { ReactNode } from "react";
import styles from "./Legend.module.css";

export type LegendSwatch =
  | "solid"
  | "outline"
  | "dashed"
  | "striped"
  | "line-solid"
  | "line-dashed"
  | "line-accent-dashed"
  | "vline-dashed"
  | "vline-accent";

export interface LegendItem {
  key: string;
  label: ReactNode;
  swatch: LegendSwatch;
}

export interface LegendProps {
  items: readonly LegendItem[];
  className?: string;
}

export function Legend({ items, className }: LegendProps) {
  return (
    <div className={className ? `${styles.legend} ${className}` : styles.legend}>
      {items.map((item) => (
        <span key={item.key} className={styles.item}>
          <i
            className={styles.swatch}
            data-swatch={item.swatch}
            aria-hidden="true"
          />
          <span className={styles.label}>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
