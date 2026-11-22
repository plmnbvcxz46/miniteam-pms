import { useId, useMemo, type ReactNode } from "react";
import { FieldContext } from "./FieldContext";
import styles from "./Field.module.css";

export type FieldLayout = "horizontal" | "vertical";
export type FieldAlign = "baseline" | "top";

export interface FieldProps {
  /** 字段标签 */
  label: ReactNode;
  /** 是否必填（仅作视觉星号装饰，aria-hidden） */
  required?: boolean;
  /** 布局：horizontal（抽屉/设置默认）| vertical（登录页等） */
  layout?: FieldLayout;
  /** 水平布局下标签对齐：baseline（单行输入默认）| top（多行/芯片组） */
  align?: FieldAlign;
  /** 辅助说明文案 */
  hint?: ReactNode;
  /** 校验错误文案（自动置位 invalid 并关联 aria-describedby + role="alert"） */
  error?: ReactNode;
  /** 自定义关联控件 id；不传则由 useId() 自动生成并经上下文下发 */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  required = false,
  layout = "horizontal",
  align = "baseline",
  hint,
  error,
  htmlFor,
  className,
  children,
}: FieldProps) {
  const autoId = useId();
  const controlId = htmlFor ?? autoId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const hasError = Boolean(error);
  const hasHint = Boolean(hint);
  const describedBy =
    [hasError ? errorId : null, hasHint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const ctx = useMemo(
    () => ({
      id: controlId,
      invalid: hasError,
      describedBy,
      required,
    }),
    [controlId, hasError, describedBy, required],
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div
        data-layout={layout}
        data-align={align}
        data-invalid={hasError ? "true" : undefined}
        data-required={required ? "true" : undefined}
        className={className ? `${styles.field} ${className}` : styles.field}
      >
        <label htmlFor={controlId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className={styles.body}>
          {children}
          {hasHint && (
            <div id={hintId} className={styles.hint}>
              {hint}
            </div>
          )}
          {hasError && (
            <div id={errorId} role="alert" className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </div>
    </FieldContext.Provider>
  );
}
