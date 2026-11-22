import { Progress } from "../../components/ui/Progress";
import type { ProjectPeriod } from "../../shared/types/global";
import { useIssue } from "../../state/issue/useIssue";
import { useTaskStore } from "../../state/task/taskStore";
import { getPeriodProgress } from "../utils";
import styles from "./SummaryCard.module.css";

export default function SummaryCard({ period }: { period: ProjectPeriod }) {
  const { taskMap } = useTaskStore();
  const { today } = useIssue();
  const tasks = Object.values(taskMap);
  const doneCount = tasks.filter((task) => task.status === "DONE").length;
  const donePercent = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;
  const { daysLeft, percent } = getPeriodProgress(period, today);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.headLabel}>距计划结束</span>
        <b className={styles.days}>
          {daysLeft}
          <small>天</small>
        </b>
      </div>
      <Progress
        variant="dual"
        surface="inverse"
        value={donePercent}
        secondaryValue={percent}
        aria-label={`项目时间已过 ${percent}%，任务完成 ${donePercent}%`}
      />
      <div className={styles.legend}>
        <span className={styles.legendItem} data-kind="time">
          时间<b>{percent}%</b>
        </span>
        <span className={styles.legendItem} data-kind="done">
          完成<b>{donePercent}%</b>
        </span>
      </div>
    </div>
  );
}
