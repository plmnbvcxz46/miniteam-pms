import { HeroCard } from "../../../components/patterns/HeroCard";
import { Badge } from "../../../components/ui/Badge";
import type { Headline } from "../../../shared/types/progress";
import { pad2 } from "../../../shared/utils/date";
import { formatForecastRange, isLate } from "../utils";
import styles from "./HeadlinePanel.module.css";

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
  const isRisk = target !== null;
  const [first, ...rest] = headline.title.split("，");
  const forecast = {
    planEnd: headline.plannedEnd,
    predictedEnd: headline.predictedEnd,
    delayDays: headline.delayDays,
  };

  return (
    <HeroCard
      tone={isRisk ? "alert" : "calm"}
      kicker="// HEADLINE"
      className={styles.card}
      badge={
        isRisk ? (
          <Badge variant="solid" size="sm">
            风险
          </Badge>
        ) : undefined
      }
    >
      <p className={styles.headline}>
        <span>{rest.length > 0 ? `${first}，` : first}</span>
        {rest.length > 0 && <span>{rest.join("，")}</span>}
      </p>

      <div className={styles.big}>
        <b className={styles.delayValue}>
          {isLate(forecast) ? `+${pad2(forecast.delayDays)}` : "00"}
        </b>
        <span className={styles.delaySub}>
          天 · 预测完成
          <br />
          {formatForecastRange(forecast)}
        </span>
      </div>

      {headline.blockedTasks.length > 0 && (
        <div className={styles.tags}>
          {headline.blockedTasks.map((task) => (
            <button
              key={task.id}
              type="button"
              className={styles.tagBtn}
              onClick={() => onOpenTask(task.id)}
            >
              {task.title}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={styles.ctaBtn}
        data-calm={!isRisk ? "true" : undefined}
        onClick={() => (isRisk ? onOpenTask(target) : onOpenBoard())}
      >
        <span>{isRisk ? "查看逾期任务" : "查看看板"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </HeroCard>
  );
}
