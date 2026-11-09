import { useState } from "react";
import { reportApi } from "../../api/report";
import { defaultRange, rangeOptions } from "../../shared/constants/reports";
import { useIssue } from "../../state/issue/useIssue";
import { useIssueData } from "../../state/issue/useIssueData";
import { useProject } from "../../state/project/useProject";
import type { BurndownRange } from "../../shared/types/reports";
import { downloadBlob } from "../../shared/utils/download";
import { useTaskStore } from "../../state/task/taskStore";
import ReportsHeader from "./components/header/ReportsHeader";
import BurndownPanel from "./components/burndown/BurndownPanel";
import LoadPanel from "./components/load/LoadPanel";
import WeeklyPanel from "./components/weekly/WeeklyPanel";
import DeviationPanel from "./components/deviation/DeviationPanel";
import ForecastHero from "./components/forecast/ForecastHero";
import "./css/reports.css";

export default function ReportsPage() {
  // 顶层状态：燃尽图范围（本周 / 全周期）
  const [range, setRange] = useState<BurndownRange>(defaultRange);
  const [exportError, setExportError] = useState("");

  const { version } = useTaskStore();
  const { isPast } = useIssue();
  const { currentProject } = useProject();

  // GET /projects/{projectId}/reports/*：概况、燃尽、每周完成、工期偏差、预测、成员负载都由后端算
  const {
    data: report,
    error,
    missing,
  } = useIssueData(reportApi.all, (pages) => pages.reports, version);

  if (missing) {
    return (
      <section className="view" id="view-reports" data-view="reports">
        <p className="page-note">这一期没有存档，看不到当时的报表。</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="view" id="view-reports" data-view="reports">
        <p className="page-note err" role="alert">
          {error}
        </p>
      </section>
    );
  }
  if (!report) return null;

  const { summary, weeklyCompleted, deviations, forecast, workload } = report;
  // 根据当前选择的范围获取燃尽图数据
  const currentBurndown =
    range === "week" ? report.burndownWeek : report.burndownAll;

  // 报表导出：GET /projects/{projectId}/reports/export 直接返回 Excel（只导出今天这一期）
  const projectId = currentProject?.id ?? null;
  const handleExport =
    isPast || projectId === null
      ? undefined
      : async () => {
          setExportError("");
          try {
            const { blob, fileName } = await reportApi.export(projectId);
            downloadBlob(fileName ?? `统计报表_${currentBurndown.today}.xlsx`, blob);
          } catch (e) {
            setExportError(e instanceof Error ? e.message : "导出失败，请稍后再试");
          }
        };

  return (
    <section className="view" id="view-reports" data-view="reports">
      <ReportsHeader
        summary={summary}
        range={range}
        rangeOptions={rangeOptions}
        onRangeChange={setRange}
        onExport={handleExport}
      />
      {exportError && (
        <p className="page-note err" role="alert">
          {exportError}
        </p>
      )}

      <div className="rpt">
        <BurndownPanel burndown={currentBurndown} />
        <LoadPanel workload={workload} />
        <WeeklyPanel items={weeklyCompleted} />
        <DeviationPanel items={deviations} />
        <ForecastHero
          forecast={forecast}
          today={currentBurndown.today}
          deviations={deviations}
        />
      </div>
    </section>
  );
}
