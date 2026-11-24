import { Fragment } from "react";
import { HeroCard } from "../../../components/patterns/HeroCard";
import { Badge } from "../../../components/ui/Badge";
import type { DurationDeviation, Forecast } from "../../../shared/types/reports";
import { toDay } from "../../../shared/utils/date";
import { formatDelayText, toMonthDay } from "../utils";
import styles from "./ForecastHero.module.css";

/** 进度条两段至少各留这么多百分比，免得斜纹段或虚线段细得看不见 */
const MIN_PART = 8;

interface ForecastHeroProps {
  forecast: Forecast;
  /** 今天 yyyy-MM-dd */
  today: string;
  deviations: DurationDeviation[];
}

function ForecastFooter({
  delayedTasks,
}: {
  delayedTasks: DurationDeviation[];
}) {
  const topDelayed = delayedTasks.slice(0, 2);
  const restDelayedCount = Math.max(0, delayedTasks.length - topDelayed.length);

  if (topDelayed.length === 0) {
    return <span className={styles.none}>暂无超期任务</span>;
  }

  return (
    <div className={styles.footerList}>
      {topDelayed.map((item, idx) => (
        <Fragment key={item.task.id}>
          {idx > 0 && <i className={styles.sep}>·</i>}
          <span className={styles.task} title={item.task.title}>
            <span className={styles.taskName}>{item.label}</span>
            <b className={styles.taskDays}>+{item.deviationDays}</b>
          </span>
        </Fragment>
      ))}
      {restDelayedCount > 0 && (
        <>
          <i className={styles.sep}>·</i>
          <span className={styles.more}>另 {restDelayedCount} 项</span>
        </>
      )}
    </div>
  );
}

export default function ForecastHero({
  forecast,
  today,
  deviations,
}: ForecastHeroProps) {
  const todayDate = toMonthDay(today, true);
  const predictedDisplay = toMonthDay(forecast.predictedEnd, true);
  const plannedDisplay = toMonthDay(forecast.plannedEnd, true);
  const delayDisplay = formatDelayText(forecast.delayDays);
  const isDelayed = forecast.delayDays > 0;
  const isEarly = forecast.delayDays < 0;

  const delayedTasks = deviations
    .filter((d) => d.deviationDays > 0)
    .sort((a, b) => b.deviationDays - a.deviationDays);

  // 进度条从今天画到两个完工日里较晚的一个：
  // 延期时实心段是今天到计划完工，右边斜纹段是超期；提前时实心段是今天到预测完工，右边虚线段是提前量
  const toPlanned = Math.max(1, toDay(forecast.plannedEnd) - toDay(today));
  const toPredicted = Math.max(1, toDay(forecast.predictedEnd) - toDay(today));
  const rawPercent = isDelayed
    ? (toPlanned / toPredicted) * 100
    : isEarly
      ? (toPredicted / toPlanned) * 100
      : 100;
  const solidPercent =
    isDelayed || isEarly
      ? Math.min(100 - MIN_PART, Math.max(MIN_PART, rawPercent))
      : 100;

  return (
    <HeroCard
      tone={forecast.risk ? "alert" : "calm"}
      kicker="// FORECAST"
      title="预测完工"
      badge={
        forecast.risk ? (
          <Badge variant="solid" size="sm">
            风险
          </Badge>
        ) : (
          <span className={styles.status}>正常</span>
        )
      }
      footer={<ForecastFooter delayedTasks={delayedTasks} />}
    >
      <div className={styles.track}>
        <div className={styles.bar}>
          <span
            className={styles.barSolid}
            style={{ width: `${solidPercent}%` }}
          />
          {isDelayed && <span className={styles.barOver} />}
          {isEarly && <span className={styles.barEarly} />}
        </div>
        <div
          className={styles.dates}
          style={isDelayed ? { width: `${solidPercent}%` } : undefined}
        >
          <span>今天 {todayDate}</span>
          <span>计划 {plannedDisplay}</span>
        </div>
      </div>

      <span className={styles.figure}>{predictedDisplay}</span>
      <div className={styles.delay}>{delayDisplay}</div>
    </HeroCard>
  );
}
