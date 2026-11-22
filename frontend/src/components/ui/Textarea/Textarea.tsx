import type { ComponentPropsWithRef } from "react";
import styles from "./Textarea.module.css";

export type TextareaVariant = "underline" | "boxed";

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  /** 样式变体：underline（表单说明下划线，默认）| boxed（协作回复全框） */
  variant?: TextareaVariant;
  /** 校验失败状态，自动同步 aria-invalid */
  invalid?: boolean;
}

export function Textarea({
  variant = "underline",
  invalid,
  className,
  ref,
  ...rest
}: TextareaProps) {
  const isInvalid = Boolean(
    invalid ?? (rest["aria-invalid"] === true || rest["aria-invalid"] === "true"),
  );

  return (
    <textarea
      ref={ref}
      aria-invalid={isInvalid || undefined}
      data-variant={variant}
      data-invalid={isInvalid ? "true" : undefined}
      className={
        className ? `${styles.textarea} ${className}` : styles.textarea
      }
      {...rest}
    />
  );
}
