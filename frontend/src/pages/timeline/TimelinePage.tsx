import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../../access/useAccess";
import { getProjectToday } from "../../utils/date";
import { useTaskStore } from "../board/taskStore";
import CriticalPanel from "./components/critical/CriticalPanel";
import GanttPanel from "./components/gantt/GanttPanel";
import TimelineHeader, {
  type TimelineScale,
} from "./components/header/TimelineHeader";
import {
  computeCpm,
  getForecast,
  getTimelineRange,
  getTimelineTasks,
} from "./utils";
import "./css/timeline.css";

export default function TimelinePage() {
  const navigate = useNavigate();
  const { permissions } = useAccess();
  const { taskMap, activityMap, openTaskForm } = useTaskStore();
  const [scale, setScale] = useState<TimelineScale>("week");
  const today = getProjectToday();

  const tasks = useMemo(() => getTimelineTasks(taskMap), [taskMap]);
  const cpm = useMemo(() => computeCpm(tasks), [tasks]);
  const forecast = useMemo(() => getForecast(tasks, cpm), [tasks, cpm]);
  const range = useMemo(
    () => getTimelineRange(tasks, forecast, today),
    [tasks, forecast, today],
  );

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
        onCreateTask={permissions.canEditTask ? () => openTaskForm() : undefined}
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
