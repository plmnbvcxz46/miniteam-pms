import { useState } from "react";
import type { BurndownRange } from "../../types/reports";
import {
  burndownByRange,
  defaultRange,
  durationDeviation,
  forecast,
  rangeOptions,
  reportSummary,
  weeklyCompleted,
  workload,
} from "../../data/reports";
import { downloadTextFile } from "../../utils/download";
import { buildReportCsv, toMonthDay } from "./utils";
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

  // 根据当前选择的范围获取燃尽图数据
  const currentBurndown = burndownByRange[range];

  // 报表导出（对齐 GET /projects/{projectId}/reports/export，接口返回 Excel，这里先导出 CSV）
  const handleExport = () => {
    downloadTextFile(
      `统计报表_${currentBurndown.today}.csv`,
      buildReportCsv({
        summary: reportSummary,
        workload,
        weeklyCompleted,
        deviations: durationDeviation,
      }),
      "text/csv",
    );
  };

  return (
    <section className="view" id="view-reports" data-view="reports">
      <ReportsHeader
        summary={reportSummary}
        range={range}
        rangeOptions={rangeOptions}
        onRangeChange={setRange}
        onExport={handleExport}
      />

      <div className="rpt">
        <BurndownPanel burndown={currentBurndown} />
        <LoadPanel workload={workload} />
        <WeeklyPanel items={weeklyCompleted} />
        <DeviationPanel items={durationDeviation} />
        <ForecastHero
          forecast={forecast}
          todayDate={toMonthDay(currentBurndown.today, true)}
          deviations={durationDeviation}
        />
      </div>
    </section>
  );
}
