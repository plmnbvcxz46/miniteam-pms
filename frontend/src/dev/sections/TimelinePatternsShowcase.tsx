import { TaskBar, type TaskBarTask } from "../../components/patterns/TaskBar";
import type { Activity } from "../../shared/types/global";
import styles from "../UiShowcasePage.module.css";
import demoStyles from "./TimelinePatternsShowcase.module.css";

const DEMO_TODAY = "2026-11-10";

const DOING_TASK: TaskBarTask = {
  status: "DOING",
  planStart: "2026-11-05",
  dueDate: "2026-11-15",
  actualStart: "2026-11-05",
  actualEnd: null,
};

const BLOCKED_TASK: TaskBarTask = {
  status: "BLOCKED",
  planStart: "2026-11-03",
  dueDate: "2026-11-08",
  actualStart: "2026-11-04",
  actualEnd: null,
};

const BLOCKED_ACTS: Activity[] = [
  {
    id: 1,
    targetType: "TASK",
    targetId: 1,
    action: "STATUS",
    detail: "把任务移到阻塞",
    user: null,
    createdAt: "2026-11-05 10:00:00",
  },
];

const OVERDUE_DONE_TASK: TaskBarTask = {
  status: "DONE",
  planStart: "2026-11-01",
  dueDate: "2026-11-05",
  actualStart: "2026-11-01",
  actualEnd: "2026-11-08",
};

const EARLY_DONE_TASK: TaskBarTask = {
  status: "DONE",
  planStart: "2026-11-01",
  dueDate: "2026-11-12",
  actualStart: "2026-11-01",
  actualEnd: "2026-11-06",
};

export function TimelinePatternsShowcase() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// PATTERNS · TASK BAR</span>
          <h2 className={styles.panelTitle}>TaskBar 三变体（阶段 4 第 7 步）</h2>
        </div>
        <p className={styles.panelNote}>
          剥离 Store，改为受控 today prop · full / compact / gantt
        </p>
      </div>

      <div className={demoStyles.block}>
        <div className={demoStyles.grid}>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>full · 进行中（DOING）</span>
            <TaskBar task={DOING_TASK} today={DEMO_TODAY} />
          </div>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>full · 阻塞且逾期（BLOCKED）</span>
            <TaskBar task={BLOCKED_TASK} today={DEMO_TODAY} activities={BLOCKED_ACTS} />
          </div>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>full · 逾期完成（DONE + past）</span>
            <TaskBar task={OVERDUE_DONE_TASK} today={DEMO_TODAY} />
          </div>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>full · 提前完成（DONE + unused）</span>
            <TaskBar task={EARLY_DONE_TASK} today={DEMO_TODAY} />
          </div>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>compact · 看板紧凑小条</span>
            <TaskBar task={DOING_TASK} today={DEMO_TODAY} variant="compact" />
          </div>
          <div className={demoStyles.card}>
            <span className={demoStyles.cardLabel}>gantt · 甘特共用轨道（隐藏局部今天线）</span>
            <TaskBar
              task={BLOCKED_TASK}
              today={DEMO_TODAY}
              activities={BLOCKED_ACTS}
              variant="gantt"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
