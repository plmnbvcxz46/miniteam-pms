import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../../state/access/useAccess";
import { progressApi } from "../../api/progress";
import { useIssue } from "../../state/issue/useIssue";
import { useIssueData } from "../../state/issue/useIssueData";
import { useTaskStore } from "../../state/task/taskStore";
import CriticalPanel from "./components/critical/CriticalPanel";
import GanttPanel from "./components/gantt/GanttPanel";
import TimelineHeader, {
  type TimelineScale,
} from "./components/header/TimelineHeader";
import {
  getTimelineRange,
  getTimelineTasks,
  toCpm,
  toForecast,
} from "./utils";
import "./css/timeline.css";

export default function TimelinePage() {
  const navigate = useNavigate();
  const { canEditTask } = useAccess();
  const { taskMap, activityMap, openTaskForm, version } = useTaskStore();
  const [scale, setScale] = useState<TimelineScale>("week");
  const { today } = useIssue();

  // 关键路径和预测由后端算：GET /gantt（预测）、GET /critical-path（每个任务的时差）
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
  // 任务表和关键路径是两次请求，只画两边都有的
  const tasks = useMemo(
    () => (cpm ? getTimelineTasks(taskMap).filter((task) => cpm.rows[task.id]) : []),
    [taskMap, cpm],
  );
  const range = useMemo(
    () => (forecast ? getTimelineRange(tasks, forecast, today) : null),
    [tasks, forecast, today],
  );

  if (gantt.missing || critical.missing) {
    return (
      <section className="view" id="view-timeline" data-view="timeline">
        <p className="page-note">这一期没有存档，看不到当时的时间线。</p>
      </section>
    );
  }
  const error = gantt.error || critical.error;
  if (error) {
    return (
      <section className="view" id="view-timeline" data-view="timeline">
        <p className="page-note err" role="alert">
          {error}
        </p>
      </section>
    );
  }
  if (!cpm || !forecast || !range) return null;

  const criticalCount = tasks.filter(
    (task) => cpm.rows[task.id].slack === 0,
  ).length;
  const kicker = `${tasks.length} 项任务 · ${criticalCount} 项在关键路径 · 总工期 ${cpm.total} 个工作日`;

  return (
    <section className="view" id="view-timeline" data-view="timeline">
      <TimelineHeader
        kicker={kicker}
        scale={scale}
        onChangeScale={setScale}
        onCreateTask={canEditTask ? () => openTaskForm() : undefined}
      />
      <GanttPanel
        tasks={tasks}
        activityMap={activityMap}
        cpm={cpm}
        forecast={forecast}
        range={range}
        today={today}
        scale={scale}
        onOpenTask={(taskId) => navigate(`/board/task?id=${taskId}`)}
      />
      <CriticalPanel tasks={tasks} cpm={cpm} />
    </section>
  );
}
