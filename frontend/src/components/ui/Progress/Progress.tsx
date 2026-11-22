import type { ComponentPropsWithRef } from "react";
import { Progress as RadixProgress } from "radix-ui";
import styles from "./Progress.module.css";

export type ProgressVariant = "solid" | "dual" | "segmented";
export type ProgressTone = "default" | "warning";
export type ProgressSegmentState = "past" | "today" | "future";

export interface ProgressSegment {
  key: string;
  state: ProgressSegmentState;
  title?: string;
}

export interface ProgressProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixProgress.Root>,
    "asChild" | "children" | "value"
  > {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  tone?: ProgressTone;
  striped?: boolean;
  thresholdPercent?: number;
  secondaryValue?: number;
  segments?: ProgressSegment[];
  totalSegments?: number;
}

function clampPercent(val: number, max: number): number {
  return max <= 0 ? 0 : Math.min(100, Math.max(0, (val / max) * 100));
}

function buildSegments(
  segments: ProgressSegment[] | undefined,
  totalSegments: number,
  primaryPercent: number,
): ProgressSegment[] {
  if (segments) return segments;
  const count = Math.max(1, totalSegments);
  return Array.from({ length: count }, (_, idx) => {
    const ratio = ((idx + 1) / count) * 100;
    const prevRatio = (idx / count) * 100;
    const state: ProgressSegmentState =
      primaryPercent >= ratio
        ? "past"
        : primaryPercent > prevRatio
          ? "today"
          : "future";
    return { key: `seg-${idx}`, state };
  });
}

function ProgressTracks(props: {
  variant: ProgressVariant;
  primaryPercent: number;
  secondaryPercent: number;
  thresholdPercent?: number;
  segments: ProgressSegment[];
}) {
  if (props.variant === "dual") {
    return (
      <div className={styles.dualWrap}>
        <div className={styles.dualTrack}>
          <span className={styles.secondaryFill} style={{ width: `${props.secondaryPercent}%` }} aria-hidden="true" />
        </div>
        <div className={styles.dualTrack}>
          <RadixProgress.Indicator className={styles.indicator} style={{ width: `${props.primaryPercent}%` }} />
        </div>
      </div>
    );
  }
  if (props.variant === "segmented") {
    return (
      <div className={styles.segmentGrid}>
        {props.segments.map((seg) => (
          <span key={seg.key} title={seg.title} data-seg-state={seg.state} className={styles.segmentCell} />
        ))}
      </div>
    );
  }
  return (
    <div className={styles.solidTrack}>
      <RadixProgress.Indicator className={styles.indicator} style={{ width: `${props.primaryPercent}%` }} />
      {props.thresholdPercent != null && (
        <span
          className={styles.thresholdLine}
          style={{ left: `${Math.min(100, Math.max(0, props.thresholdPercent))}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
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
  const resolvedSegments = buildSegments(segments, totalSegments, primaryPercent);

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
      <ProgressTracks
        variant={variant}
        primaryPercent={primaryPercent}
        secondaryPercent={secondaryPercent}
        thresholdPercent={thresholdPercent}
        segments={resolvedSegments}
      />
    </RadixProgress.Root>
  );
}
