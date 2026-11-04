import type {
  Burndown,
  BurndownRange,
  DurationDeviation,
  Forecast,
  ReportSummary,
  Reports,
  WeeklyCompleted,
} from "../types/reports";
import { workloadApi } from "./task";
import { http } from "./http";

export const reportApi = {
  summary: (projectId: number) =>
    http.get<ReportSummary>(`/projects/${projectId}/reports/summary`),
  burndown: (projectId: number, range: BurndownRange) =>
    http.get<Burndown>(`/projects/${projectId}/reports/burndown`, { range }),
  weeklyCompleted: (projectId: number) =>
    http.get<WeeklyCompleted[]>(`/projects/${projectId}/reports/weekly-completed`),
  durationDeviation: (projectId: number) =>
    http.get<DurationDeviation[]>(`/projects/${projectId}/reports/duration-deviation`),
  forecast: (projectId: number) =>
    http.get<Forecast>(`/projects/${projectId}/reports/forecast`),
  /** 导出 Excel，文件名由接口给（统计报表_日期.xlsx） */
  export: (projectId: number) => http.download(`/projects/${projectId}/reports/export`),

  /** 报表页要的全部数据：几个接口一起取 */
  all: async (projectId: number): Promise<Reports> => {
    const [summary, burndownAll, burndownWeek, weeklyCompleted, deviations, forecast, workload] =
      await Promise.all([
        reportApi.summary(projectId),
        reportApi.burndown(projectId, "all"),
        reportApi.burndown(projectId, "week"),
        reportApi.weeklyCompleted(projectId),
        reportApi.durationDeviation(projectId),
        reportApi.forecast(projectId),
        workloadApi.get(projectId),
      ]);
    return { summary, burndownAll, burndownWeek, weeklyCompleted, deviations, forecast, workload };
  },
};
