import type { TimelineForecast } from "../../../timeline/utils";
import type { Headline } from "../../utils";
import { formatForecastRange, isLate, pad2 } from "../../utils";

interface HeadlinePanelProps {
  headline: Headline;
  forecast: TimelineForecast;
  onOpenTask: (taskId: number) => void;
  onOpenBoard: () => void;
}

export default function HeadlinePanel({
  headline,
  forecast,
  onOpenTask,
  onOpenBoard,
}: HeadlinePanelProps) {
  const { task, blocked } = headline;

  return (
    <section className={task ? "hero" : "hero calm"}>
      <div className="hk">
        <span>// HEADLINE</span>
        <span className="chip">风险</span>
      </div>
      <p className="headline">
        {task ? (
          <>
            <span>
              {task.title}逾期 {task.overdueDays} 天，
            </span>
            <span>
              {blocked.length > 0
                ? `${blocked.length} 项任务因此受阻`
                : "暂时没有任务因此受阻"}
            </span>
          </>
        ) : (
          <>
            <span>没有逾期任务，</span>
            <span>按计划推进</span>
          </>
        )}
      </p>
      <div className="big">
        <b>{isLate(forecast) ? `+${pad2(forecast.delayDays)}` : "00"}</b>
        <span>
          天 · 预测完成
          <br />
          {formatForecastRange(forecast)}
        </span>
      </div>
      {blocked.length > 0 && (
        <div className="tags">
          {blocked.map((dep) => (
            <span
              key={dep.dependencyId}
              onClick={() => onOpenTask(dep.task.id)}
            >
              {dep.task.title}
            </span>
          ))}
        </div>
      )}
      <a
        className="go"
        onClick={() => (task ? onOpenTask(task.id) : onOpenBoard())}
      >
        {task ? "查看逾期任务" : "去看板"} <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
