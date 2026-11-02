import type { DependencyTask, TaskDetail } from "../../../../../types/task";
import DependencyRow from "./DependencyRow";
import TaskTimeline from "./TaskTimeline";

interface SchedulePanelProps {
  task: TaskDetail;
  today: string;
  onOpenTask: (taskId: number) => void;
}

export default function SchedulePanel({
  task,
  today,
  onOpenTask,
}: SchedulePanelProps) {
  const renderDeps = (deps: DependencyTask[], emptyText: string) =>
    deps.length > 0 ? (
      deps.map((dep) => (
        <DependencyRow
          key={dep.dependencyId}
          dep={dep}
          onOpenTask={onOpenTask}
        />
      ))
    ) : (
      <div className="dep-none">{emptyText}</div>
    );

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k">// SCHEDULE</span>
          <h2>排期与依赖</h2>
        </div>
        <span className="u">单位（天）</span>
      </div>
      <TaskTimeline task={task} today={today} />
      <div className="scroll-y">
        <div className="dep-h">PREDECESSORS</div>
        {renderDeps(task.predecessors, "没有前置任务")}
        <div className="dep-h">SUCCESSORS</div>
        {renderDeps(task.successors, "没有后续任务")}
      </div>
    </section>
  );
}
