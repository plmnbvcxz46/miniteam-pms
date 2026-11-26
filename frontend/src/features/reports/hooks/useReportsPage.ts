import { useState } from "react";
import { reportApi } from "../../../services/report";
import { defaultRange, rangeOptions } from "../../../shared/constants/reports";
import type { BurndownRange } from "../../../shared/types/reports";
import { downloadBlob } from "../../../shared/utils/download";
import { useIssue } from "../../../stores/issue/useIssue";
import { useIssueData } from "../../../stores/issue/useIssueData";
import { useProject } from "../../../stores/project/useProject";
import { useTaskStore } from "../../../stores/task/taskStore";

export function useReportsPage() {
  const [range, setRange] = useState<BurndownRange>(defaultRange);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { version } = useTaskStore();
  const { isPast } = useIssue();
  const { currentProject } = useProject();

  const {
    data: report,
    error,
    missing,
  } = useIssueData(reportApi.all, (pages) => pages.reports, version);

  const projectId = currentProject?.id ?? null;
  const currentBurndown = report
    ? range === "week"
      ? report.burndownWeek
      : report.burndownAll
    : null;

  const handleExport =
    isPast || projectId === null || !currentBurndown
      ? undefined
      : async () => {
          if (exporting) return;
          setExporting(true);
          setExportError("");
          try {
            const { blob, fileName } = await reportApi.export(projectId);
            downloadBlob(fileName ?? `统计报表_${currentBurndown.today}.xlsx`, blob);
          } catch (e) {
            setExportError(e instanceof Error ? e.message : "导出失败，请稍后再试");
          } finally {
            setExporting(false);
          }
        };

  return {
    report,
    currentBurndown,
    range,
    rangeOptions,
    onRangeChange: setRange,
    exporting,
    exportError,
    onExport: handleExport,
    error,
    missing,
  };
}
