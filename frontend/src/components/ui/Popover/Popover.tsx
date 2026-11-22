import type { ComponentPropsWithRef } from "react";
import { Popover as RadixPopover } from "radix-ui";
import styles from "./Popover.module.css";

export const Popover = RadixPopover.Root;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;

export type PopoverTriggerProps = ComponentPropsWithRef<
  typeof RadixPopover.Trigger
>;

export function PopoverTrigger({
  className,
  asChild,
  ref,
  ...rest
}: PopoverTriggerProps) {
  return (
    <RadixPopover.Trigger
      ref={ref}
      asChild={asChild}
      className={
        asChild
          ? className
          : className
            ? `${styles.trigger} ${className}`
            : styles.trigger
      }
      {...rest}
    />
  );
}

export type PopoverPadding = "default" | "none";

export interface PopoverContentProps
  extends ComponentPropsWithRef<typeof RadixPopover.Content> {
  /** 内容内边距模式：default（默认 12px）| none（无内边距，供通栏头部/底部使用） */
  padding?: PopoverPadding;
}

export function PopoverContent({
  sideOffset = 6,
  collisionPadding = 8,
  align = "start",
  padding = "default",
  className,
  ref,
  ...rest
}: PopoverContentProps) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        align={align}
        data-padding={padding}
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      />
    </RadixPopover.Portal>
  );
}
