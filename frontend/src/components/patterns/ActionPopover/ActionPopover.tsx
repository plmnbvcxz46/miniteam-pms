import type { ComponentPropsWithRef, ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/Popover";
import styles from "./ActionPopover.module.css";

export type ActionPopoverWidth = "sm" | "md" | "lg";

export interface ActionPopoverProps {
  /** 受控打开状态 */
  open?: boolean;
  /** 开关状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 触发按钮（须支持 ref 转发与点击事件） */
  trigger: ReactNode;
  /** 黑色刊头标题（自动加 // 前缀） */
  title: ReactNode;
  /** 可选刊头右侧计数或状态 */
  meta?: ReactNode;
  /** 浮层宽度档位：sm(360px) | md(400px) | lg(440px) */
  width?: ActionPopoverWidth;
  /** 对齐方式 */
  align?: "start" | "center" | "end";
  /** 偏移距离 */
  sideOffset?: number;
  /** 列表为空时显示 */
  isEmpty?: boolean;
  /** 空态文案 */
  emptyText?: ReactNode;
  /** 可选底部通栏操作槽 */
  footer?: ReactNode;
  children: ReactNode;
}

export function ActionPopover({
  open,
  onOpenChange,
  trigger,
  title,
  meta,
  width = "md",
  align = "start",
  sideOffset = 8,
  isEmpty = false,
  emptyText = "暂无内容",
  footer,
  children,
}: ActionPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        padding="none"
        data-width={width}
        className={styles.popover}
      >
        <h4 className={styles.header}>
          <span>{title}</span>
          {meta != null && <em className={styles.meta}>{meta}</em>}
        </h4>
        <div className={styles.list}>
          {isEmpty ? <p className={styles.empty}>{emptyText}</p> : children}
        </div>
        {footer != null && <div className={styles.footer}>{footer}</div>}
      </PopoverContent>
    </Popover>
  );
}

export type ActionPopoverFooterButtonProps = ComponentPropsWithRef<"button">;

export function ActionPopoverFooterButton({
  type = "button",
  className,
  children,
  ref,
  ...rest
}: ActionPopoverFooterButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={
        className ? `${styles.footerButton} ${className}` : styles.footerButton
      }
      {...rest}
    >
      {children}
    </button>
  );
}
