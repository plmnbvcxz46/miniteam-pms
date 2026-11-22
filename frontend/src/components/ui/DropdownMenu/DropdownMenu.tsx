import type { ComponentPropsWithRef } from "react";
import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import styles from "./DropdownMenu.module.css";

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export type DropdownMenuContentProps = ComponentPropsWithRef<
  typeof RadixDropdownMenu.Content
>;

export function DropdownMenuContent({
  sideOffset = 6,
  collisionPadding = 8,
  align = "end",
  className,
  ref,
  ...rest
}: DropdownMenuContentProps) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        align={align}
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      />
    </RadixDropdownMenu.Portal>
  );
}

export type DropdownMenuItemTone = "default" | "danger";

export interface DropdownMenuItemProps
  extends ComponentPropsWithRef<typeof RadixDropdownMenu.Item> {
  /** 菜单项语义语气：default（常规）| danger（高危/退出/删除） */
  tone?: DropdownMenuItemTone;
}

export function DropdownMenuItem({
  tone = "default",
  className,
  ref,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      ref={ref}
      data-tone={tone}
      className={className ? `${styles.item} ${className}` : styles.item}
      {...rest}
    />
  );
}

export type DropdownMenuLabelProps = ComponentPropsWithRef<
  typeof RadixDropdownMenu.Label
>;

export function DropdownMenuLabel({
  className,
  ref,
  ...rest
}: DropdownMenuLabelProps) {
  return (
    <RadixDropdownMenu.Label
      ref={ref}
      className={className ? `${styles.label} ${className}` : styles.label}
      {...rest}
    />
  );
}

export type DropdownMenuSeparatorProps = ComponentPropsWithRef<
  typeof RadixDropdownMenu.Separator
>;

export function DropdownMenuSeparator({
  className,
  ref,
  ...rest
}: DropdownMenuSeparatorProps) {
  return (
    <RadixDropdownMenu.Separator
      ref={ref}
      className={
        className ? `${styles.separator} ${className}` : styles.separator
      }
      {...rest}
    />
  );
}
