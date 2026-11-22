import type { ComponentPropsWithRef, ReactNode } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { Button } from "../Button";
import { Separator } from "../Separator";
import styles from "./Drawer.module.css";

export type DrawerSize = "md" | "lg";

export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;

export interface DrawerContentProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixDialog.Content>,
    "title" | "asChild"
  > {
  /** 抽屉宽度：md（640px 表单抽屉，默认）| lg（880px 设置抽屉） */
  size?: DrawerSize;
  /** 可选上方英文小标（// WORD） */
  kicker?: ReactNode;
  /** 抽屉主标题（必填，提供无障碍对话框名称） */
  title: ReactNode;
  /** 可选副标题/说明 */
  description?: ReactNode;
  /** 可选头部附加区域（如标签栏） */
  headerExtra?: ReactNode;
  /** 可选底部操作栏 */
  footer?: ReactNode;
}

export function DrawerContent({
  size = "md",
  kicker,
  title,
  description,
  headerExtra,
  footer,
  className,
  children,
  ref,
  ...rest
}: DrawerContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.overlay} />
      <RadixDialog.Content
        ref={ref}
        data-size={size}
        aria-describedby={description ? undefined : undefined}
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      >
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleBlock}>
              {kicker != null && <span className={styles.kicker}>{kicker}</span>}
              <RadixDialog.Title className={styles.title}>
                {title}
              </RadixDialog.Title>
              {description != null && (
                <RadixDialog.Description className={styles.description}>
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <Button variant="default" size="icon" aria-label="关闭">
                <span className={styles.closeGlyph} aria-hidden="true">
                  ×
                </span>
              </Button>
            </RadixDialog.Close>
          </div>
          {headerExtra != null && (
            <div className={styles.headerExtra}>{headerExtra}</div>
          )}
          <Separator variant="masthead" />
        </header>

        <div className={styles.body}>{children}</div>

        {footer != null && <footer className={styles.footer}>{footer}</footer>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
