import { currentProjectPeriod } from "../../../data/global";
import { getProjectToday, toDay } from "../../../utils/date";
import { getWeekProgress } from "../../utils";

export default function ArchiveCard() {
  const today = getProjectToday();
  const { total, current } = getWeekProgress(currentProjectPeriod, today);
  const daysLeft = Math.max(
    0,
    Math.round(toDay(currentProjectPeriod.planEnd) - toDay(today)),
  );
  return (
    <div className="arch-card">
      <i aria-hidden="true" />
      <b>项目摘要</b>
      <p>
        {current ? `第 ${current} / ${total} 周` : `共 ${total} 周`}
        <br />
        距计划结束 {daysLeft} 天
      </p>
      <button type="button" className="open-issues">
        查看往期 <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
