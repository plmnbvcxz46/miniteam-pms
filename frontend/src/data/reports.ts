import type { BurndownRange, RangeOption } from "../types/reports";

/* 全局数据（登录用户、项目成员、项目 ID、期号）见 ./global */

/*
 * 假数据口径（各接口之间保持一致）：
 * - 项目 2026-09-21（周一）开始，共 10 周，计划 2026-11-27 完工
 * - “今天”固定为 2026-10-22（第 5 周周四），与成员页假数据同一天
 * - 燃尽图、完成任务、工期偏差、预测完工由任务数据现算，见 pages/reports/derive.ts
 */

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 顶部范围切换按钮，顺序即按钮顺序 */
export const rangeOptions: RangeOption[] = [
  { value: "week", label: "本周" },
  { value: "all", label: "全周期" },
];

/** 默认范围 */
export const defaultRange: BurndownRange = "week";
