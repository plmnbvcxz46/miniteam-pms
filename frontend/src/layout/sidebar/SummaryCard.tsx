import { useIssue } from "../../state/issue/useIssue";
import { useTaskStore } from "../../state/task/taskStore";
import type { ProjectPeriod } from "../../shared/types/global";
import { getPeriodProgress } from "../utils";

export default function SummaryCard({ period }: { period: ProjectPeriod }) {
  const { taskMap } = useTaskStore();
  const { today } = useIssue();
  const tasks = Object.values(taskMap);
  const doneCount = tasks.filter((task) => task.status === "DONE").length;
  const donePercent = tasks.length
    ? Math.round((doneCount / tasks.length) * 100)
    : 0;
  const { daysLeft, percent } = getPeriodProgress(
    period,
    today,
  );
  return (
    <div className="sum-card">
      <div className="head">
        <span>距计划结束</span>
        <b>
          {daysLeft}
          <small>天</small>
        </b>
      </div>
      <div className="gauge" aria-hidden="true">
        <i className="time" style={{ width: `${percent}%` }} />
        <i className="done" style={{ width: `${donePercent}%` }} />
      </div>
      <div className="legend">
        <span>
          时间<b>{percent}%</b>
        </span>
        <span className="go">
          完成<b>{donePercent}%</b>
        </span>
      </div>
    </div>
  );
}
