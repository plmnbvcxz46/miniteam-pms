import type { ComponentPropsWithRef } from "react";
import { Select as RadixSelect } from "radix-ui";
import styles from "./Select.module.css";

export const Select = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;
export const SelectGroup = RadixSelect.Group;

export interface SelectTriggerProps
  extends ComponentPropsWithRef<typeof RadixSelect.Trigger> {
  /** 校验失败态，自动同步 aria-invalid */
  invalid?: boolean;
}

export function SelectTrigger({
  invalid,
  className,
  children,
  ref,
  ...rest
}: SelectTriggerProps) {
  const isInvalid = Boolean(
    invalid ?? (rest["aria-invalid"] === true || rest["aria-invalid"] === "true"),
  );

  return (
    <RadixSelect.Trigger
      ref={ref}
      aria-invalid={isInvalid || undefined}
      data-variant="underline"
      data-invalid={isInvalid ? "true" : undefined}
      className={className ? `${styles.trigger} ${className}` : styles.trigger}
      {...rest}
    >
      <span className={styles.valueSlot}>{children}</span>
      <RadixSelect.Icon className={styles.chevron} aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export type SelectContentProps = ComponentPropsWithRef<
  typeof RadixSelect.Content
>;

export function SelectContent({
  className,
  position = "popper",
  sideOffset = 4,
  children,
  ref,
  ...rest
}: SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      >
        <RadixSelect.Viewport className={styles.viewport}>
          {children}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export type SelectItemProps = ComponentPropsWithRef<typeof RadixSelect.Item>;

export function SelectItem({
  className,
  children,
  ref,
  ...rest
}: SelectItemProps) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={className ? `${styles.item} ${className}` : styles.item}
      {...rest}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className={styles.itemIndicator}>
        ✓
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

export type SelectLabelProps = ComponentPropsWithRef<typeof RadixSelect.Label>;

export function SelectLabel({ className, ref, ...rest }: SelectLabelProps) {
  return (
    <RadixSelect.Label
      ref={ref}
      className={className ? `${styles.label} ${className}` : styles.label}
      {...rest}
    />
  );
}

export type SelectSeparatorProps = ComponentPropsWithRef<
  typeof RadixSelect.Separator
>;

export function SelectSeparator({
  className,
  ref,
  ...rest
}: SelectSeparatorProps) {
  return (
    <RadixSelect.Separator
      ref={ref}
      className={
        className ? `${styles.separator} ${className}` : styles.separator
      }
      {...rest}
    />
  );
}
