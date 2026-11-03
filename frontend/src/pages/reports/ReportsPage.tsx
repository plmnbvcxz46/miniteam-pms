import { useMemo, useState } from "react";
import { useAccess } from "../../access/useAccess";
import { defaultRange, rangeOptions } from "../../data/reports";
import { useIssue } from "../../issue/useIssue";
import { useProjectPeriod } from "../../layouts/useProjectPeriod";
import type { BurndownRange } from "../../types/reports";
import { downloadBlob } from "../../utils/download";
import { buildXlsx } from "../../utils/xlsx";
import { buildReport } from "./derive";
import { useTaskStore } from "../board/taskStore";
import { REPORT_SHEET_WIDTHS, buildReportRows } from "./utils";
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

  const { taskMap } = useTaskStore();
  const { members } = useAccess();
  const { today } = useIssue();
  const period = useProjectPeriod();
  const report = useMemo(
    () => buildReport(taskMap, members, period, today),
    [taskMap, members, period, today],
  );
  const { summary, weeklyCompleted, deviations, forecast, workload } = report;

  // 根据当前选择的范围获取燃尽图数据
  const currentBurndown = range === "week" ? report.burndownWeek : report.burndownAll;

  // 报表导出（对齐 GET /projects/{projectId}/reports/export，接口返回 Excel 文件）
  const handleExport = () => {
    const rows = buildReportRows({
      summary,
      workload,
      weeklyCompleted,
      deviations,
    });
    downloadBlob(
      `统计报表_${currentBurndown.today}.xlsx`,
      new Blob([buildXlsx("统计报表", rows, REPORT_SHEET_WIDTHS)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
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
