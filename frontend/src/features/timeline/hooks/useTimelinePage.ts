import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { progressApi } from "../../../services/progress";
import { useAccess } from "../../../stores/access/useAccess";
import { useIssue } from "../../../stores/issue/useIssue";
import { useIssueData } from "../../../stores/issue/useIssueData";
import { useTaskStore } from "../../../stores/task/taskStore";
import {
  getTimelineRange,
  getTimelineTasks,
  toCpm,
  toForecast,
} from "../utils";

export type TimelineScale = "week" | "month";

export function useTimelinePage() {
  const navigate = useNavigate();
  const { canEditTask } = useAccess();
  const { taskMap, activityMap, openTaskForm, version } = useTaskStore();
  const [scale, setScale] = useState<TimelineScale>("week");
  const { today } = useIssue();

  const gantt = useIssueData(progressApi.gantt, (pages) => pages.gantt, version);
  const critical = useIssueData(
    progressApi.criticalPath,
    (pages) => pages.criticalPath,
    version,
  );
  const cpm = useMemo(
    () => (critical.data ? toCpm(critical.data) : null),
    [critical.data],
  );
  const forecast = useMemo(
    () => (gantt.data ? toForecast(gantt.data) : null),
    [gantt.data],
  );
  const tasks = useMemo(
    () => (cpm ? getTimelineTasks(taskMap).filter((t) => cpm.rows[t.id]) : []),
    [taskMap, cpm],
  );
  const range = useMemo(
    () => (forecast ? getTimelineRange(tasks, forecast, today) : null),
    [tasks, forecast, today],
  );

  const criticalCount = tasks.filter(
    (task) => cpm?.rows[task.id]?.slack === 0,
  ).length;
  const kicker = cpm
    ? `${tasks.length} 项任务 · ${criticalCount} 项在关键路径 · 总工期 ${cpm.total} 个工作日`
    : "";

  return {
    today,
    scale,
    setScale,
    missing: gantt.missing || critical.missing,
    error: gantt.error || critical.error,
    ready: Boolean(cpm && forecast && range),
    cpm,
    forecast,
    tasks,
    range,
    activityMap,
    kicker,
    canEditTask,
    onCreateTask: canEditTask ? () => openTaskForm() : undefined,
    onOpenTask: (taskId: number) => navigate(`/board/task?id=${taskId}`),
  };
}
