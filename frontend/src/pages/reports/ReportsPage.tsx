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

  // 报表导出（对齐 GET /projects/{projectId}/reports/export）
  const handleExport = () => {
    window.alert("已生成并下载统计报表（Excel 格式）");
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
        <BurndownPanel burndown={currentBurndown} range={range} />
        <LoadPanel workload={workload} />
        <WeeklyPanel items={weeklyCompleted} />
        <DeviationPanel items={durationDeviation} />
        <ForecastHero forecast={forecast} />
      </div>
    </section>
  );
}
