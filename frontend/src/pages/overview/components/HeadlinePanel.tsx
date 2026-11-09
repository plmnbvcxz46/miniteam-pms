import type { Headline } from "../../../shared/types/progress";
import { pad2 } from "../../../shared/utils/date";
import { formatForecastRange, isLate } from "../utils";

interface HeadlinePanelProps {
  headline: Headline;
  onOpenTask: (taskId: number) => void;
  onOpenBoard: () => void;
}

export default function HeadlinePanel({
  headline,
  onOpenTask,
  onOpenBoard,
}: HeadlinePanelProps) {
  const target = headline.targetTaskId;
  // 标题是整句话，逗号前后各一段
  const [first, ...rest] = headline.title.split("，");
  const forecast = {
    planEnd: headline.plannedEnd,
    predictedEnd: headline.predictedEnd,
    delayDays: headline.delayDays,
  };

  return (
    <section className={target !== null ? "hero" : "hero calm"}>
      <div className="hk">
        <span>// HEADLINE</span>
        <span className="chip">风险</span>
      </div>
      <p className="headline">
        <span>{rest.length > 0 ? `${first}，` : first}</span>
        {rest.length > 0 && <span>{rest.join("，")}</span>}
      </p>
      <div className="big">
        <b>{isLate(forecast) ? `+${pad2(forecast.delayDays)}` : "00"}</b>
        <span>
          天 · 预测完成
          <br />
          {formatForecastRange(forecast)}
        </span>
      </div>
      {headline.blockedTasks.length > 0 && (
        <div className="tags">
          {headline.blockedTasks.map((task) => (
            <span key={task.id} onClick={() => onOpenTask(task.id)}>
              {task.title}
            </span>
          ))}
        </div>
      )}
      <a
        className="go"
        onClick={() => (target !== null ? onOpenTask(target) : onOpenBoard())}
      >
        {target !== null ? "查看逾期任务" : "查看看板"}{" "}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
