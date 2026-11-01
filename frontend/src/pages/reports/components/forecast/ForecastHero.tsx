import { Fragment } from "react";
import type { DurationDeviation, Forecast } from "../../../../types/reports";
import { formatDelayText, toMonthDay } from "../../utils";

interface ForecastHeroProps {
  forecast: Forecast;
  todayDate: string;
  deviations: DurationDeviation[];
}

export default function ForecastHero({
  forecast,
  todayDate,
  deviations,
}: ForecastHeroProps) {
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

  // 进度条主段占比（延期时主段代表计划工期，留出右侧展示直边斜纹超期段）
  const solidPercent = isDelayed ? 84 : isEarly ? 90 : 100;

  return (
    <section className={`hero${forecast.risk ? "" : " calm"}`} id="rp-hero">
      <div className="hk">
        <div>
          <span className="k">// FORECAST</span>
          <h2>预测完工</h2>
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
