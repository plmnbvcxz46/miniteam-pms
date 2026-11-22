import type { ComponentPropsWithRef } from "react";
import styles from "./Input.module.css";

export type InputVariant = "underline" | "boxed";
export type InputSize = "sm" | "md";

export interface InputProps
  extends Omit<ComponentPropsWithRef<"input">, "size"> {
  /** 样式变体：underline（表单/设置下划线，默认）| boxed（搜索/全框） */
  variant?: InputVariant;
  /** 尺寸档位：sm(30px) | md(34px，默认) */
  size?: InputSize;
  /** 校验失败状态，自动同步 aria-invalid */
  invalid?: boolean;
  /** 强制等宽字体（数值、代码、编号等） */
  mono?: boolean;
}

export function Input({
  variant = "underline",
  size = "md",
  invalid,
  mono = false,
  className,
  ref,
  ...rest
}: InputProps) {
  const isInvalid = Boolean(
    invalid ?? (rest["aria-invalid"] === true || rest["aria-invalid"] === "true"),
  );

  return (
    <input
      ref={ref}
      aria-invalid={isInvalid || undefined}
      data-variant={variant}
      data-size={size}
      data-invalid={isInvalid ? "true" : undefined}
      data-mono={mono ? "true" : undefined}
      className={className ? `${styles.input} ${className}` : styles.input}
      {...rest}
    />
  );
}
