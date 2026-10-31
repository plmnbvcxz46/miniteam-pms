/**
 * 统计报表模块类型定义（对齐 docs/api/openapi.yaml 的“统计报表”标签）
 * 共享结构（UserBrief、TaskRef、IssueInfo 等）见 ./global
 */
import type { IssueInfo, TaskRef, UserBrief } from "./global";

/** 燃尽图范围：week 本周 / all 全周期（GET .../reports/burndown?range=） */
export type BurndownRange = "week" | "all";

/** 完成率、按期率、延期率（ReportSummary），GET /projects/{projectId}/reports/summary */
export interface ReportSummary {
  /** 当前第几周 */
  weekNo: number;
  /** 项目总周数 */
  totalWeeks: number;
  /** 任务总数 */
  total: number;
  /** 已完成 */
  done: number;
  /** 剩余 */
  remaining: number;
  /** 完成率 0-1 */
  completionRate: number;
  /** 按期率 0-1 */
  onTimeRate: number;
  /** 延期率 0-1 */
  delayRate: number;
}

/** 燃尽图上的一个点（BurndownPoint） */
export interface BurndownPoint {
  /** yyyy-MM-dd */
  date: string;
  /** 计划剩余 */
  planned: number;
  /** 实际剩余，今天之后为空 */
  actual: number | null;
  /** 预测剩余，今天之前为空 */
  predicted: number | null;
}

/** 燃尽图（Burndown），GET /projects/{projectId}/reports/burndown */
export interface Burndown {
  /** "项" 或 "小时" */
  unit: string;
  /** yyyy-MM-dd */
  today: string;
  points: BurndownPoint[];
  /** yyyy-MM-dd */
  plannedEnd: string;
  /** yyyy-MM-dd */
  predictedEnd: string;
}

/** 每周完成任务（WeeklyCompleted），GET /projects/{projectId}/reports/weekly-completed 的数组元素 */
export interface WeeklyCompleted {
  /** 周一日期 yyyy-MM-dd */
  weekStart: string;
  count: number;
  /** 是否本周 */
  current: boolean;
}

/** 工期偏差（DurationDeviation），GET /projects/{projectId}/reports/duration-deviation 的数组元素 */
export interface DurationDeviation {
  task: TaskRef;
  /** 行标题，例如 "需求分析" */
  label: string;
  planDays: number;
  actualDays: number;
  /** 正数为超期 */
  deviationDays: number;
}

/** 全项目预测完工（Forecast），GET /projects/{projectId}/reports/forecast */
export interface Forecast {
  /** yyyy-MM-dd */
  plannedEnd: string;
  /** yyyy-MM-dd */
  predictedEnd: string;
  delayDays: number;
  remaining: number;
  risk: boolean;
  /** 例如 "按当前燃尽速度推算" */
  basis: string;
}

/** 缺陷密度（DefectDensity），GET /projects/{projectId}/reports/defect-density 的数组元素 */
export interface DefectDensity {
  module: string;
  defectCount: number;
  taskCount: number;
  density: number;
}

/** 成员负载（WorkloadMember） */
export interface WorkloadMember {
  user: UserBrief;
  /** 未完成任务预估工时之和 */
  loadHours: number;
  /** 本周工时 */
  weeklyHours: number;
  /** 每周工时上限 */
  capacity: number;
  taskCount: number;
  overCapacity: boolean;
}

/** 成员负载（Workload），GET /projects/{projectId}/workload */
export interface Workload {
  members: WorkloadMember[];
  /** 负载方差 */
  variance: number;
}

/** 范围切换按钮（纯前端常量，不来自接口） */
export interface RangeOption {
  value: BurndownRange;
  label: string;
}

/** 报表页快照（预留往期切换使用） */
export interface ReportSnapshot extends IssueInfo {
  summary: ReportSummary;
  burndown: Record<BurndownRange, Burndown>;
  weeklyCompleted: WeeklyCompleted[];
  durationDeviation: DurationDeviation[];
  forecast: Forecast;
  defectDensity: DefectDensity[];
  workload: Workload;
}

