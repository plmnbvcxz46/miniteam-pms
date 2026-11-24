import {
  calculateLoadBar,
  DEFAULT_LOAD_SCALE,
  getLoadScale,
} from "../../../shared/utils/load";
import styles from "./LoadBar.module.css";

export type LoadBarVariant = "detailed" | "compact";

export interface LoadBarProps {
  /** 本周实际/已分配工时（小时） */
  hours: number;
  /** 每周工时上限（小时） */
  capacity: number;
  /** 一组工时条共用的坐标轴最大值，不传则按单条自动计算 */
  maxScale?: number;
  /** 视觉变体：detailed（带上限虚线与超载斜纹）| compact（用于选择器下拉行） */
  variant?: LoadBarVariant;
  /** 读屏无障碍标签 */
  label?: string;
  className?: string;
}

export function LoadBar({
  hours,
  capacity,
  maxScale,
  variant = "detailed",
  label = "本周工时",
  className,
}: LoadBarProps) {
  const effectiveMax =
    maxScale ?? Math.max(DEFAULT_LOAD_SCALE, getLoadScale([hours], [capacity]));
  const { capPercent, fillPercent, overPercent, overLeftPercent, isOver } =
    calculateLoadBar(hours, capacity, effectiveMax);

  const compactPercent =
    capacity <= 0 ? (hours > 0 ? 100 : 0) : Math.min((hours / capacity) * 100, 100);
  const compactOver = hours > capacity;
  const meterOver = variant === "compact" ? compactOver : isOver;
  const meterMax =
    variant === "compact"
      ? Math.max(capacity, hours, 1)
      : Math.max(effectiveMax, capacity, 1);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={meterMax}
      aria-valuenow={hours}
      aria-valuetext={`${hours} 小时，上限 ${capacity} 小时`}
      data-variant={variant}
      data-over={meterOver ? "true" : undefined}
      className={className ? `${styles.root} ${className}` : styles.root}
    >
      {variant === "compact" ? (
        <span
          className={styles.compactFill}
          style={{ width: `${compactPercent}%` }}
        />
      ) : (
        <>
          <span className={styles.fill} style={{ width: `${fillPercent}%` }} />
          {isOver && (
            <span
              className={styles.over}
              style={{
                left: `${overLeftPercent}%`,
                width: `${overPercent}%`,
              }}
            />
          )}
          <span className={styles.cap} style={{ left: `${capPercent}%` }} />
        </>
      )}
    </div>
  );
}
