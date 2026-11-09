import type { BurndownRange, RangeOption } from "../types/reports";

/** 顶部范围切换按钮，顺序即按钮顺序 */
export const rangeOptions: RangeOption[] = [
  { value: "week", label: "本周" },
  { value: "all", label: "全周期" },
];

/** 默认范围 */
export const defaultRange: BurndownRange = "week";
