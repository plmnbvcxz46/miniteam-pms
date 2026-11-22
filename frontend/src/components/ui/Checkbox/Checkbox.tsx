import type { ComponentPropsWithRef, ReactNode } from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { useFieldControl } from "../Field";
import styles from "./Checkbox.module.css";

export type CheckboxCheckedState = boolean | "indeterminate";

export interface CheckboxProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixCheckbox.Root>,
    "asChild" | "children"
  > {
  /** 可选右侧说明标签；禁用时随控件同步弱化 */
  label?: ReactNode;
  /** 校验失败状态，自动同步 aria-invalid */
  invalid?: boolean;
}

export function Checkbox({
  label,
  invalid,
  id,
  disabled = false,
  className,
  ref,
  ...rest
}: CheckboxProps) {
  const field = useFieldControl();
  const isInvalid = Boolean(
    invalid ??
      (rest["aria-invalid"] === true ||
        rest["aria-invalid"] === "true" ||
        field?.invalid),
  );
  const describedBy = rest["aria-describedby"] ?? field?.describedBy;

  const control = (
    <RadixCheckbox.Root
      ref={ref}
      id={id ?? field?.id}
      disabled={disabled}
      aria-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      data-invalid={isInvalid ? "true" : undefined}
      className={
        label
          ? styles.root
          : className
            ? `${styles.root} ${className}`
            : styles.root
      }
      {...rest}
    >
      <RadixCheckbox.Indicator className={styles.indicator}>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 5.2L4 7.7L8.5 2.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );

  if (!label) return control;

  return (
    <label
      data-disabled={disabled ? "true" : undefined}
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
    >
      {control}
      <span className={styles.label}>{label}</span>
    </label>
  );
}
