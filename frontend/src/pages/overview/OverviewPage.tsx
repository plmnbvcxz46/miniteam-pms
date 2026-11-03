import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { currentProjectPeriod, users } from "../../data/global";
import { getProjectToday } from "../../utils/date";
import { useTaskStore } from "../board/taskStore";
import { computeCpm, getForecast, getTimelineTasks } from "../timeline/utils";
import CriticalChainPanel from "./components/critical/CriticalChainPanel";
import FigureStrip from "./components/figures/FigureStrip";
import HeadlinePanel from "./components/headline/HeadlinePanel";
import OverviewHeader from "./components/header/OverviewHeader";
import ProgressPanel from "./components/progress/ProgressPanel";
import SchedulePanel from "./components/schedule/SchedulePanel";
import TodoPanel from "./components/todo/TodoPanel";
import {
  formatKicker,
  getCriticalChain,
  getDayProgress,
  getHeadline,
  getOverviewStats,
  getSchedule,
  getTodos,
  getWeek,
} from "./utils";
import "./css/overview.css";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { taskMap, openTaskForm } = useTaskStore();
  const today = getProjectToday();

  const all = useMemo(() => Object.values(taskMap), [taskMap]);
  // 关键路径和预测与时间线页同一套算法
  const tasks = useMemo(() => getTimelineTasks(taskMap), [taskMap]);
  const cpm = useMemo(() => computeCpm(tasks), [tasks]);
  const forecast = useMemo(() => getForecast(tasks, cpm), [tasks, cpm]);

  const stats = getOverviewStats(all, cpm, today, currentProjectPeriod);
  const headline = getHeadline(stats.overdue, cpm);
  const todos = getTodos(all, today);
  const chain = getCriticalChain(tasks, cpm);
  const week = getWeek(today);
  const dayProgress = getDayProgress();
  const schedule = getSchedule(all, Object.values(users), week, today);

  const openTask = (taskId: number) => navigate(`/board/task?id=${taskId}`);

  return (
    <section className="view" id="view-overview" data-view="overview">
      <OverviewHeader
        kicker={formatKicker(stats, today, currentProjectPeriod)}
        onCreateTask={() => openTaskForm()}
      />
      <FigureStrip stats={stats} planEnd={currentProjectPeriod.planEnd} />

      <div className="ov1">
        <SchedulePanel
          week={week}
          rows={schedule}
          dayProgress={dayProgress}
          onOpenTask={openTask}
        />
        <HeadlinePanel
          headline={headline}
          forecast={forecast}
          onOpenTask={openTask}
          onOpenBoard={() => navigate("/board")}
        />
      </div>

      <div className="ov2">
        <TodoPanel items={todos} onOpenTask={openTask} />
        <ProgressPanel done={stats.done} total={stats.total} />
        <CriticalChainPanel
          chain={chain}
          forecast={forecast}
          totalDays={cpm.total}
        />
      </div>
    </section>
  );
}
