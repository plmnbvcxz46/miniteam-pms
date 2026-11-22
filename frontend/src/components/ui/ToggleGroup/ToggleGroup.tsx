import type { ComponentPropsWithRef, ReactNode } from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import styles from "./ToggleGroup.module.css";

export type ToggleGroupVariant = "segmented" | "chips";

export type ToggleGroupProps = ComponentPropsWithRef<
  typeof RadixToggleGroup.Root
> & {
  /** 视觉变体：segmented（连体分段，默认）| chips（流式单/多选芯片） */
  variant?: ToggleGroupVariant;
};

export function ToggleGroup({
  variant = "segmented",
  className,
  ref,
  ...rest
}: ToggleGroupProps) {
  return (
    <RadixToggleGroup.Root
      ref={ref}
      data-variant={variant}
      className={className ? `${styles.root} ${className}` : styles.root}
      {...rest}
    />
  );
}

export interface ToggleGroupItemProps
  extends ComponentPropsWithRef<typeof RadixToggleGroup.Item> {
  /** 可选前置图标 */
  leadingIcon?: ReactNode;
}

export function ToggleGroupItem({
  leadingIcon,
  className,
  children,
  ref,
  ...rest
}: ToggleGroupItemProps) {
  return (
    <RadixToggleGroup.Item
      ref={ref}
      className={className ? `${styles.item} ${className}` : styles.item}
      {...rest}
    >
      {leadingIcon != null && (
        <span className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {children}
    </RadixToggleGroup.Item>
  );
}
