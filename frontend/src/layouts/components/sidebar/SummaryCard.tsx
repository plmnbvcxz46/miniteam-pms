import { currentProjectPeriod } from "../../../data/global";
import { useTaskStore } from "../../../pages/board/taskStore";
import { getProjectToday } from "../../../utils/date";
import { getPeriodProgress } from "../../utils";

export default function SummaryCard() {
  const { taskMap } = useTaskStore();
  const tasks = Object.values(taskMap);
  const doneCount = tasks.filter((task) => task.status === "DONE").length;
  const donePercent = tasks.length ? (doneCount / tasks.length) * 100 : 0;
  const { daysLeft, percent } = getPeriodProgress(
    currentProjectPeriod,
    getProjectToday(),
  );
  return (
    <div className="sum-card">
      <div className="k">// 项目摘要</div>
      <div className="big">
        <b>{daysLeft}</b>
        <span>天后计划结束</span>
      </div>
      <div className="row">
        <p>
          时间进度 <b>{percent}%</b>
        </p>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="row">
        <p>
          任务完成{" "}
          <b>
            {doneCount} / {tasks.length}
          </b>
        </p>
        <div className="bar go" aria-hidden="true">
          <i style={{ width: `${donePercent}%` }} />
        </div>
      </div>
    </div>
  );
}
