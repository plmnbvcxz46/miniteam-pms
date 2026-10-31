import type {
  Burndown,
  BurndownRange,
  DefectDensity,
  DurationDeviation,
  Forecast,
  RangeOption,
  ReportSnapshot,
  ReportSummary,
  WeeklyCompleted,
  Workload,
} from "../types/reports";
import { currentIssue, users } from "./global";

/* 全局数据（登录用户、项目成员、项目 ID、期号）见 ./global */

/*
 * 假数据口径（各接口之间保持一致）：
 * - 项目 2026-09-21（周一）开始，共 10 周，计划 2026-11-27 完工
 * - “今天”固定为 2026-10-22（第 5 周周四），与成员页假数据同一天
 * - 共 42 项任务，已完成 18 项，剩余 24 项
 * - 按当前燃尽速度（约 0.6 项/天）预测 2026-12-01 完工，晚 4 天
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

/** 成员工时条的坐标轴最大值（小时），上限 40 落在 80% 处 */
export const loadAxisMax = 50;

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const { pmA, devA, devB, qaC } = users;

/** GET /projects/{projectId}/reports/summary */
export const reportSummary: ReportSummary = {
  weekNo: 5,
  totalWeeks: 10,
  total: 42,
  done: 18,
  remaining: 24,
  completionRate: 0.4286,
  onTimeRate: 0.7778,
  delayRate: 0.2222,
};

/** GET /projects/{projectId}/reports/burndown?range=all */
export const burndownAll: Burndown = {
  unit: "项",
  today: "2026-10-22",
  plannedEnd: "2026-11-27",
  predictedEnd: "2026-12-01",
  points: [
    { date: "2026-09-21", planned: 42, actual: 42, predicted: null },
    { date: "2026-09-28", planned: 37.6, actual: 39, predicted: null },
    { date: "2026-10-05", planned: 33.2, actual: 34, predicted: null },
    { date: "2026-10-12", planned: 28.8, actual: 30, predicted: null },
    { date: "2026-10-19", planned: 24.4, actual: 26, predicted: null },
    { date: "2026-10-22", planned: 22.6, actual: 24, predicted: 24 },
    { date: "2026-10-26", planned: 20.1, actual: null, predicted: 21.6 },
    { date: "2026-11-02", planned: 15.7, actual: null, predicted: 17.4 },
    { date: "2026-11-09", planned: 11.3, actual: null, predicted: 13.2 },
    { date: "2026-11-16", planned: 6.9, actual: null, predicted: 9 },
    { date: "2026-11-23", planned: 2.5, actual: null, predicted: 4.8 },
    { date: "2026-11-27", planned: 0, actual: null, predicted: 2.4 },
    { date: "2026-12-01", planned: 0, actual: null, predicted: 0 },
  ],
};

/** GET /projects/{projectId}/reports/burndown?range=week */
export const burndownWeek: Burndown = {
  unit: "项",
  today: "2026-10-22",
  plannedEnd: "2026-11-27",
  predictedEnd: "2026-12-01",
  points: [
    { date: "2026-10-19", planned: 24.4, actual: 26, predicted: null },
    { date: "2026-10-20", planned: 23.8, actual: 25, predicted: null },
    { date: "2026-10-21", planned: 23.2, actual: 25, predicted: null },
    { date: "2026-10-22", planned: 22.6, actual: 24, predicted: 24 },
    { date: "2026-10-23", planned: 21.9, actual: null, predicted: 23.4 },
    { date: "2026-10-24", planned: 21.3, actual: null, predicted: 22.8 },
    { date: "2026-10-25", planned: 20.7, actual: null, predicted: 22.2 },
  ],
};

/** 按范围取燃尽图（对应 range 查询参数） */
export const burndownByRange: Record<BurndownRange, Burndown> = {
  week: burndownWeek,
  all: burndownAll,
};

/** GET /projects/{projectId}/reports/weekly-completed */
export const weeklyCompleted: WeeklyCompleted[] = [
  { weekStart: "2026-09-21", count: 3, current: false },
  { weekStart: "2026-09-28", count: 5, current: false },
  { weekStart: "2026-10-05", count: 4, current: false },
  { weekStart: "2026-10-12", count: 4, current: false },
  { weekStart: "2026-10-19", count: 2, current: true },
  { weekStart: "2026-10-26", count: 0, current: false },
  { weekStart: "2026-11-02", count: 0, current: false },
  { weekStart: "2026-11-09", count: 0, current: false },
  { weekStart: "2026-11-16", count: 0, current: false },
  { weekStart: "2026-11-23", count: 0, current: false },
];

/** GET /projects/{projectId}/reports/duration-deviation */
export const durationDeviation: DurationDeviation[] = [
  {
    task: { id: 103, taskNo: 3, title: "需求分析与用例梳理" },
    label: "需求分析",
    planDays: 5,
    actualDays: 6,
    deviationDays: 1,
  },
  {
    task: { id: 107, taskNo: 7, title: "数据库表结构设计" },
    label: "数据库设计",
    planDays: 4,
    actualDays: 3,
    deviationDays: -1,
  },
  {
    task: { id: 111, taskNo: 11, title: "任务与看板接口开发" },
    label: "接口开发",
    planDays: 8,
    actualDays: 11,
    deviationDays: 3,
  },
  {
    task: { id: 114, taskNo: 14, title: "任务看板页面" },
    label: "看板前端",
    planDays: 6,
    actualDays: 6,
    deviationDays: 0,
  },
  {
    task: { id: 118, taskNo: 18, title: "登录与鉴权" },
    label: "登录鉴权",
    planDays: 3,
    actualDays: 5,
    deviationDays: 2,
  },
];

/** GET /projects/{projectId}/reports/forecast */
export const forecast: Forecast = {
  plannedEnd: "2026-11-27",
  predictedEnd: "2026-12-01",
  delayDays: 4,
  remaining: 24,
  risk: true,
  basis: "按当前燃尽速度推算",
};

/** GET /projects/{projectId}/reports/defect-density */
export const defectDensity: DefectDensity[] = [
  { module: "任务看板", defectCount: 5, taskCount: 9, density: 0.56 },
  { module: "进度排期", defectCount: 3, taskCount: 8, density: 0.38 },
  { module: "文档管理", defectCount: 2, taskCount: 7, density: 0.29 },
  { module: "成员权限", defectCount: 1, taskCount: 6, density: 0.17 },
  { module: "统计报表", defectCount: 1, taskCount: 6, density: 0.17 },
  { module: "登录鉴权", defectCount: 0, taskCount: 6, density: 0 },
];

/** GET /projects/{projectId}/workload（weeklyHours / capacity 与成员页一致） */
export const workload: Workload = {
  members: [
    {
      user: pmA,
      loadHours: 52,
      weeklyHours: 46,
      capacity: 40,
      taskCount: 4,
      overCapacity: true,
    },
    {
      user: devA,
      loadHours: 44,
      weeklyHours: 38,
      capacity: 40,
      taskCount: 5,
      overCapacity: false,
    },
    {
      user: devB,
      loadHours: 30,
      weeklyHours: 32,
      capacity: 40,
      taskCount: 3,
      overCapacity: false,
    },
    {
      user: qaC,
      loadHours: 20,
      weeklyHours: 24,
      capacity: 40,
      taskCount: 3,
      overCapacity: false,
    },
  ],
  variance: 152.75,
};

/** 当前默认期数快照对象 */
export const currentSnapshot: ReportSnapshot = {
  ...currentIssue,
  summary: reportSummary,
  burndown: burndownByRange,
  weeklyCompleted,
  durationDeviation,
  forecast,
  defectDensity,
  workload,
};

