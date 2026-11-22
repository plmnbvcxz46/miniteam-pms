import type { ComponentPropsWithRef } from "react";
import { Progress as RadixProgress } from "radix-ui";
import styles from "./Progress.module.css";

export type ProgressVariant = "solid" | "dual" | "segmented";
export type ProgressTone = "default" | "warning";
export type ProgressSegmentState = "past" | "today" | "future";

export interface ProgressSegment {
  /** 分段唯一键 */
  key: string;
  /** 分段状态：past（已过，墨色）| today（当期/今日，信号橙）| future（未来，纸色） */
  state: ProgressSegmentState;
  /** 可选原生 title 悬浮说明 */
  title?: string;
}

export interface ProgressProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixProgress.Root>,
    "asChild" | "children" | "value"
  > {
  /** 当前进度值（0 ~ max） */
  value: number;
  /** 最大值（默认 100） */
  max?: number;
  /**
   * 视觉变体：
   * - solid：单轨进度条（支持 tone、striped 斜纹、thresholdPercent 上限线）
   * - dual：双轨对比进度条（主进度 value + 次级参考进度 secondaryValue，如完成率 vs 时间进度）
   * - segmented：分段格子进度条（对应顶栏 WeekLine 按天/按周分段）
   */
  variant?: ProgressVariant;
  /** 语义语气：default（墨色）| warning（信号橙预警/超载） */
  tone?: ProgressTone;
  /** 是否叠加超载斜纹（用于 solid / dual 预警态） */
  striped?: boolean;
  /** 可选上限基准线百分比（0 ~ 100，如负载 100% 满载水位线） */
  thresholdPercent?: number;
  /** dual 变体的次轨进度值（0 ~ max，如时间进度） */
  secondaryValue?: number;
  /** segmented 变体的显式分段数组；若不传则按 totalSegments 与 value 自动生成 */
  segments?: ProgressSegment[];
  /** segmented 变体自动生成时的总格数（默认 7） */
  totalSegments?: number;
}

function clampPercent(val: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (val / max) * 100));
}

export function Progress({
  value,
  max = 100,
  variant = "solid",
  tone = "default",
  striped = false,
  thresholdPercent,
  secondaryValue = 0,
  segments,
  totalSegments = 7,
  className,
  ref,
  ...rest
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clampedValue = Math.min(safeMax, Math.max(0, value));
  const primaryPercent = clampPercent(clampedValue, safeMax);
  const secondaryPercent = clampPercent(secondaryValue, safeMax);

  const resolvedSegments: ProgressSegment[] =
    segments ??
    Array.from({ length: Math.max(1, totalSegments) }, (_, idx) => {
      const ratio = ((idx + 1) / Math.max(1, totalSegments)) * 100;
      const prevRatio = (idx / Math.max(1, totalSegments)) * 100;
      let state: ProgressSegmentState = "future";
      if (primaryPercent >= ratio) {
        state = "past";
      } else if (primaryPercent > prevRatio) {
        state = "today";
      }
      return {
        key: `seg-${idx}`,
        state,
      };
    });

  return (
    <RadixProgress.Root
      ref={ref}
      value={clampedValue}
      max={safeMax}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clampedValue}
      data-variant={variant}
      data-tone={tone}
      data-striped={striped ? "true" : undefined}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      {variant === "solid" && (
        <div className={styles.solidTrack}>
          <RadixProgress.Indicator
            className={styles.indicator}
            style={{ width: `${primaryPercent}%` }}
          />
          {thresholdPercent != null && (
            <span
              className={styles.thresholdLine}
              style={{
                left: `${Math.min(100, Math.max(0, thresholdPercent))}%`,
              }}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {variant === "dual" && (
        <div className={styles.dualWrap}>
          <div className={styles.dualTrack}>
            <span
              className={styles.secondaryFill}
              style={{ width: `${secondaryPercent}%` }}
              aria-hidden="true"
            />
          </div>
          <div className={styles.dualTrack}>
            <RadixProgress.Indicator
              className={styles.indicator}
              style={{ width: `${primaryPercent}%` }}
            />
          </div>
        </div>
      )}

      {variant === "segmented" && (
        <div className={styles.segmentGrid}>
          {resolvedSegments.map((seg) => (
            <span
              key={seg.key}
              title={seg.title}
              data-seg-state={seg.state}
              className={styles.segmentCell}
            />
          ))}
        </div>
      )}
    </RadixProgress.Root>
  );
}
