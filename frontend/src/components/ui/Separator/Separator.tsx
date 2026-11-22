import type { ComponentPropsWithRef } from "react";
import { Separator as RadixSeparator } from "radix-ui";
import styles from "./Separator.module.css";

export type SeparatorVariant = "single" | "double" | "dashed";
export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixSeparator.Root>,
    "asChild" | "children"
  > {
  /**
   * 视觉变体：
   * - single：1.5px 墨色单实线（默认）
   * - double：报刊刊头上粗下细双线
   * - dashed：1px 弱化虚线（行间/列表内部分割）
   */
  variant?: SeparatorVariant;
  /** 方向：horizontal（默认）| vertical */
  orientation?: SeparatorOrientation;
}

export function Separator({
  variant = "single",
  orientation = "horizontal",
  decorative = true,
  className,
  ref,
  ...rest
}: SeparatorProps) {
  return (
    <RadixSeparator.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      data-variant={variant}
      className={
        className ? `${styles.separator} ${className}` : styles.separator
      }
      {...rest}
    />
  );
}
