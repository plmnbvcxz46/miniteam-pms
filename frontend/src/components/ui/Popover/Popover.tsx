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

export type PopoverContentProps = ComponentPropsWithRef<
  typeof RadixPopover.Content
>;

export function PopoverContent({
  sideOffset = 6,
  collisionPadding = 8,
  align = "start",
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
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      />
    </RadixPopover.Portal>
  );
}
