import { Panel } from "../../../components/patterns/Panel";
import { TaskBar } from "../../../components/patterns/TaskBar";
import type { Activity } from "../../../shared/types/global";
import type { DependencyTask, TaskDetail } from "../../../shared/types/task";
import DependencyRow from "./DependencyRow";
import styles from "./SchedulePanel.module.css";

interface SchedulePanelProps {
  task: TaskDetail;
  activities: Activity[];
  today: string;
  onOpenTask: (taskId: number) => void;
}

export default function SchedulePanel({
  task,
  activities,
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
      <div className={styles.empty}>{emptyText}</div>
    );

  return (
    <Panel
      kicker="// SCHEDULE"
      title="排期与依赖"
      headerRight={<span className={styles.unit}>单位（天）</span>}
    >
      <div className={styles.taskBarWrap}>
        <TaskBar task={task} activities={activities} today={today} />
      </div>
      <div className={styles.deps}>
        <div className={styles.depHeading}>// PREDECESSORS</div>
        {renderDeps(task.predecessors, "没有前置任务")}
        <div className={styles.depHeading}>// SUCCESSORS</div>
        {renderDeps(task.successors, "没有后续任务")}
      </div>
    </Panel>
  );
}
