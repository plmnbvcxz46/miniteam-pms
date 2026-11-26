import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectPeriod } from "../../../layout/useProjectPeriod";
import { progressApi } from "../../../services/progress";
import { toForecast } from "../../../shared/utils/forecast";
import { useAccess } from "../../../stores/access/useAccess";
import { useIssue } from "../../../stores/issue/useIssue";
import { useIssueData } from "../../../stores/issue/useIssueData";
import { useTaskStore } from "../../../stores/task/taskStore";
import {
  formatKicker,
  getDayProgress,
  getWeek,
  toScheduleRows,
  toTodoRows,
} from "../utils";

export function useOverviewPage() {
  const navigate = useNavigate();
  const { canEditTask } = useAccess();
  const period = useProjectPeriod();
  const { taskMap, openTaskForm, version } = useTaskStore();
  const { today } = useIssue();

  const {
    data: overview,
    error,
    missing,
  } = useIssueData(progressApi.overview, (pages) => pages.overview, version);

  const week = useMemo(() => getWeek(today), [today]);
  const schedule = useMemo(
    () => (overview ? toScheduleRows(overview.schedule.rows, week) : []),
    [overview, week],
  );
  const todos = useMemo(
    () => (overview ? toTodoRows(overview.todo, taskMap) : []),
    [overview, taskMap],
  );

  const forecast = overview
    ? toForecast({
        plannedEnd: overview.criticalPath.plannedEnd,
        predictedEnd: overview.criticalPath.predictedEnd,
        delayDays: overview.headline.delayDays,
      })
    : null;

  return {
    missing,
    error,
    overview,
    week,
    schedule,
    todos,
    forecast,
    dayProgress: getDayProgress(),
    kicker: overview ? formatKicker(overview.stats, today, period) : "",
    onCreateTask: canEditTask ? () => openTaskForm() : undefined,
    openTask: (taskId: number) => navigate(`/board/task?id=${taskId}`),
    openBoard: () => navigate("/board"),
  };
}
