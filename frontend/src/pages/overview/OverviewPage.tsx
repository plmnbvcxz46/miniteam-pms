import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../../state/access/useAccess";
import { progressApi } from "../../api/progress";
import { useIssue } from "../../state/issue/useIssue";
import { useIssueData } from "../../state/issue/useIssueData";
import { useProjectPeriod } from "../../layout/useProjectPeriod";
import { useTaskStore } from "../../state/task/taskStore";
import { toForecast } from "../timeline/utils";
import CriticalChainPanel from "./components/critical/CriticalChainPanel";
import FigureStrip from "./components/figures/FigureStrip";
import HeadlinePanel from "./components/headline/HeadlinePanel";
import OverviewHeader from "./components/header/OverviewHeader";
import ProgressPanel from "./components/progress/ProgressPanel";
import SchedulePanel from "./components/schedule/SchedulePanel";
import TodoPanel from "./components/todo/TodoPanel";
import {
  formatKicker,
  getDayProgress,
  getWeek,
  getWorstOverdue,
  toScheduleRows,
  toTodoRows,
} from "./utils";
import "./css/overview.css";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { canEditTask } = useAccess();
  const period = useProjectPeriod();
  const { taskMap, openTaskForm, version } = useTaskStore();
  const { today } = useIssue();

  // GET /projects/{projectId}/overview：统计、头条、排期、待办、进度、关键路径都由后端算
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
  const worst = useMemo(
    () => getWorstOverdue(Object.values(taskMap)),
    [taskMap],
  );

  if (missing) {
    return (
      <section className="view" id="view-overview" data-view="overview">
        <p className="page-note">这一期没有存档，看不到当时的日报。</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="view" id="view-overview" data-view="overview">
        <p className="page-note err" role="alert">
          {error}
        </p>
      </section>
    );
  }
  if (!overview) return null;

  const forecast = toForecast({
    plannedEnd: overview.criticalPath.plannedEnd,
    predictedEnd: overview.criticalPath.predictedEnd,
    delayDays: overview.headline.delayDays,
  });
  const dayProgress = getDayProgress();
  const openTask = (taskId: number) => navigate(`/board/task?id=${taskId}`);

  return (
    <section className="view" id="view-overview" data-view="overview">
      <OverviewHeader
        kicker={formatKicker(overview.stats, today, period)}
        onCreateTask={canEditTask ? () => openTaskForm() : undefined}
      />
      <FigureStrip stats={overview.stats} worst={worst} />

      <div className="ov1">
        <SchedulePanel
          week={week}
          rows={schedule}
          dayProgress={dayProgress}
          onOpenTask={openTask}
        />
        <HeadlinePanel
          headline={overview.headline}
          onOpenTask={openTask}
          onOpenBoard={() => navigate("/board")}
        />
      </div>

      <div className="ov2">
        <TodoPanel
          items={todos}
          total={overview.todoTotal}
          onOpenTask={openTask}
        />
        <ProgressPanel
          done={overview.progress.done}
          total={overview.progress.total}
        />
        <CriticalChainPanel
          chain={overview.criticalPath.nodes}
          forecast={forecast}
          totalDays={overview.criticalPath.totalDuration}
        />
      </div>
    </section>
  );
}
