import type { Forecast } from "../../../../types/reports";
import { formatDelayText, toMonthDay } from "../../utils";

interface ForecastHeroProps {
  forecast: Forecast;
}

export default function ForecastHero({ forecast }: ForecastHeroProps) {
  const predictedDisplay = toMonthDay(forecast.predictedEnd, false);
  const plannedDisplay = toMonthDay(forecast.plannedEnd);
  const delayDisplay = formatDelayText(forecast.delayDays);

  return (
    <section className={`hero${forecast.risk ? "" : " calm"}`} id="rp-hero">
      <div className="hk">
        <span>// 全项目预测完工</span>
        <span className="chip">{forecast.risk ? "风险" : "正常"}</span>
      </div>
      <span className="huge" id="rp-n">
        {predictedDisplay}
      </span>
      <div className="hsub" id="rp-sub">
        计划 {plannedDisplay} · {delayDisplay}
        <br />
        {forecast.basis}，剩余 {forecast.remaining} 项
      </div>
    </section>
  );
}
