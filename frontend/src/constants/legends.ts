import type { CSSProperties } from "react";

/**
 * 图例项样式定义
 */
export interface LegendSampleStyle {
  className: string;
  style?: CSSProperties;
}

/**
 * 图例项配置定义
 */
export interface LegendItemConfig {
  key: string;
  label: string;
  sample: LegendSampleStyle;
}

/**
 * 全局复用的图例视觉样本样式库
 */
export const LEGEND_SAMPLES = {
  /** 进行中（实心色块） */
  IN_PROGRESS: {
    className: "key on",
  },
  /** 逾期（斑马斜线纹色块） */
  OVERDUE: {
    className: "key over",
  },
  /** 截止日（垂直虚线） */
  DUE_LINE: {
    className: "key dash",
    style: {
      width: 0,
      height: "12px",
      borderWidth: "0 0 0 1.5px",
    },
  },
  /** 今天（高亮垂直实线） */
  TODAY_LINE: {
    className: "key",
    style: {
      width: 0,
      height: "12px",
      borderWidth: "0 0 0 1.5px",
      borderColor: "var(--signal)",
    },
  },
  /** 计划/空心虚线块 */
  PLAN_DASH: {
    className: "key dash",
  },
  /** 已完成/细边框块 */
  DONE: {
    className: "key done",
  },
} as const satisfies Record<string, LegendSampleStyle>;

/**
 * 文档模块修订中（Revising）的图例配置列表
 */
export const DOC_REVISING_LEGENDS: LegendItemConfig[] = [
  {
    key: "inProgress",
    label: "已进行",
    sample: LEGEND_SAMPLES.IN_PROGRESS,
  },
  {
    key: "overdue",
    label: "逾期",
    sample: LEGEND_SAMPLES.OVERDUE,
  },
  {
    key: "dueLine",
    label: "截止日",
    sample: LEGEND_SAMPLES.DUE_LINE,
  },
  {
    key: "todayLine",
    label: "今天",
    sample: LEGEND_SAMPLES.TODAY_LINE,
  },
];
