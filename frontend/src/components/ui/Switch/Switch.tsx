import type { ComponentPropsWithRef } from "react";
import { Switch as RadixSwitch } from "radix-ui";
import { useFieldControl } from "../Field";
import { Spinner } from "../Spinner";
import styles from "./Switch.module.css";

export type SwitchVariant = "track" | "segmented";

export interface SwitchProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixSwitch.Root>,
    "asChild" | "children"
  > {
  /** 视觉变体：track（单轨“有/无”，默认）| segmented（双格“启用/停用”） */
  variant?: SwitchVariant;
  /** 加载态：展示 Spinner 并禁止重复点击 */
  loading?: boolean;
  /** 开启/关闭文案：[开启文案, 关闭文案] */
  labels?: [string, string];
}

export function Switch({
  variant = "track",
  loading = false,
  disabled = false,
  labels,
  id,
  className,
  ref,
  ...rest
}: SwitchProps) {
  const field = useFieldControl();
  const [onLabel, offLabel] =
    labels ?? (variant === "segmented" ? ["启用", "停用"] : ["有", "无"]);
  const isDisabled = disabled || loading;

  return (
    <RadixSwitch.Root
      ref={ref}
      id={id ?? field?.id}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      data-variant={variant}
      data-loading={loading ? "true" : undefined}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    >
      {variant === "track" ? (
        <span className={styles.trackContent}>
          <span className={styles.bar} aria-hidden="true">
            <RadixSwitch.Thumb className={styles.thumb} />
          </span>
          <span className={styles.stateText}>
            <span className={styles.onText}>{onLabel}</span>
            <span className={styles.offText}>{offLabel}</span>
          </span>
        </span>
      ) : (
        <span className={styles.segContent}>
          <span className={styles.segOn}>{onLabel}</span>
          <span className={styles.segOff}>{offLabel}</span>
        </span>
      )}
      {loading && (
        <span className={styles.spinnerSlot} aria-hidden="true">
          <Spinner size="sm" />
        </span>
      )}
    </RadixSwitch.Root>
  );
}
