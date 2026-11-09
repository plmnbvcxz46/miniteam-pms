import { Fragment } from "react";
import type { DurationDeviation, Forecast } from "../../../../types/reports";
import { toDay } from "../../../../utils/date";
import { formatDelayText, toMonthDay } from "../../utils";

/** 进度条两段至少各留这么多百分比，免得斜纹段或虚线段细得看不见 */
const MIN_PART = 8;

interface ForecastHeroProps {
  forecast: Forecast;
  /** 今天 yyyy-MM-dd */
  today: string;
  deviations: DurationDeviation[];
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

  // 选出拖期最多的任务（按超期天数降序取前 2 项）
  const delayedTasks = deviations
    .filter((d) => d.deviationDays > 0)
    .sort((a, b) => b.deviationDays - a.deviationDays);
  const topDelayed = delayedTasks.slice(0, 2);
  const restDelayedCount = Math.max(0, delayedTasks.length - topDelayed.length);

  // 进度条从今天画到两个完工日里较晚的一个：
  // 延期时实心段是今天到计划完工，右边斜纹段是超期；提前时实心段是今天到预测完工，右边虚线段是提前量
  const toPlanned = Math.max(1, toDay(forecast.plannedEnd) - toDay(today));
  const toPredicted = Math.max(1, toDay(forecast.predictedEnd) - toDay(today));
  const rawPercent = isDelayed
    ? (toPlanned / toPredicted) * 100
    : isEarly
      ? (toPredicted / toPlanned) * 100
      : 100;
  const solidPercent = isDelayed || isEarly
    ? Math.min(100 - MIN_PART, Math.max(MIN_PART, rawPercent))
    : 100;

  return (
    <section className={`hero${forecast.risk ? "" : " calm"}`} id="rp-hero">
      <div className="hk">
        <div>
          <span className="k t-kicker">// FORECAST</span>
          <h2 className="t-section-title">预测完工</h2>
        </div>
        {forecast.risk ? (
          <span className="chip">风险</span>
        ) : (
          <span className="fstatus">正常</span>
        )}
      </div>

      {/* 周期进度条与日期坐标 */}
      <div className="ftrack">
        <div className="fbar">
          <span
            className="fbar-solid"
            style={{ width: `${solidPercent}%` }}
          />
          {isDelayed && <span className="fbar-over" />}
          {isEarly && <span className="fbar-early" />}
        </div>
        <div
          className="fdates"
          style={
            isDelayed ? { width: `${solidPercent}%` } : undefined
          }
        >
          <span>今天 {todayDate}</span>
          <span>计划 {plannedDisplay}</span>
        </div>
      </div>

      {/* 预测完工大号日期与延期结论 */}
      <span className="huge" id="rp-n">
        {predictedDisplay}
      </span>
      <div className="fdelay" id="rp-sub">
        {delayDisplay}
      </div>

      {/* 底部超期任务摘要（按拖期最多排序，不写“拖期最多”前缀） */}
      <div className="ffoot">
        {topDelayed.length > 0 ? (
          <div className="ffoot-list">
            {topDelayed.map((item, idx) => (
              <Fragment key={item.task.id}>
                {idx > 0 && <i className="fsep">·</i>}
                <span className="ftask" title={item.task.title}>
                  <span className="fname">{item.label}</span>
                  <b>+{item.deviationDays}</b>
                </span>
              </Fragment>
            ))}
            {restDelayedCount > 0 && (
              <>
                <i className="fsep">·</i>
                <span className="fmore">另 {restDelayedCount} 项</span>
              </>
            )}
          </div>
        ) : (
          <span className="fnone">暂无超期任务</span>
        )}
      </div>
    </section>
  );
}
