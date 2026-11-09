import TaskBar from "../../../shared/components/TaskBar";
import type { Activity } from "../../../shared/types/global";
import type { DependencyTask, TaskDetail } from "../../../shared/types/task";
import DependencyRow from "./DependencyRow";

interface SchedulePanelProps {
  task: TaskDetail;
  activities: Activity[];
  onOpenTask: (taskId: number) => void;
}

export default function SchedulePanel({
  task,
  activities,
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
          <span className="k t-kicker">// SCHEDULE</span>
          <h2 className="t-section-title">排期与依赖</h2>
        </div>
        <span className="u">单位（天）</span>
      </div>
      <div className="tt">
        <TaskBar task={task} activities={activities} />
      </div>
      <div className="scroll-y">
        <div className="dep-h">PREDECESSORS</div>
        {renderDeps(task.predecessors, "没有前置任务")}
        <div className="dep-h">SUCCESSORS</div>
        {renderDeps(task.successors, "没有后续任务")}
      </div>
    </section>
  );
}
