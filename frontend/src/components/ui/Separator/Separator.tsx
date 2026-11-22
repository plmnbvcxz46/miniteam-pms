import type { ComponentPropsWithRef } from "react";
import { Separator as RadixSeparator } from "radix-ui";
import styles from "./Separator.module.css";

export type SeparatorVariant = "single" | "double" | "masthead" | "dashed";
export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixSeparator.Root>,
    "asChild" | "children"
  > {
  /**
   * 视觉变体：
   * - single：1.5px 墨色单实线（默认）
   * - double：2px + 1.5px 抽屉/分区双线
   * - masthead：5px + 1.5px 报刊页头粗细双横线
   * - dashed：1px 墨色虚线（行间/表单字段分隔）
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
