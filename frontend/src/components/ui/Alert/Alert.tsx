import type { ComponentPropsWithRef, ReactNode } from "react";
import styles from "./Alert.module.css";

export type AlertVariant = "inline" | "banner";
export type AlertTone = "info" | "warning" | "danger";

export interface AlertProps
  extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** 布局变体：inline（块内消息条，默认）| banner（通栏横幅，如归档/往期只读提示） */
  variant?: AlertVariant;
  /**
   * 语义语气：
   * - info：中性色（墨色/中性灰描边与浅灰底，不占信号橙配额）
   * - warning：信号橙提示（风险预警、限制提示）
   * - danger：信号橙报错（校验失败、权限/状态拦截）
   */
  tone?: AlertTone;
  /** 可选标题 */
  title?: ReactNode;
  /** 可选右侧操作槽（如“返回当期”按钮） */
  action?: ReactNode;
}

export function Alert({
  variant = "inline",
  tone = "info",
  title,
  action,
  role,
  className,
  children,
  ref,
  ...rest
}: AlertProps) {
  const resolvedRole = role ?? (tone === "info" ? "status" : "alert");

  return (
    <div
      ref={ref}
      role={resolvedRole}
      data-variant={variant}
      data-tone={tone}
      className={className ? `${styles.alert} ${className}` : styles.alert}
      {...rest}
    >
      <div className={styles.body}>
        {title != null && <div className={styles.title}>{title}</div>}
        {children != null && <div className={styles.content}>{children}</div>}
      </div>
      {action != null && <div className={styles.action}>{action}</div>}
    </div>
  );
}
