import type { Activity } from "../../../../../types/global";
import { formatLogTime } from "../../utils";

interface TaskLogPanelProps {
  activities: Activity[];
  today: string;
}

export default function TaskLogPanel({ activities, today }: TaskLogPanelProps) {
  return (
    <section className="pnl flat dark">
      <div className="phd">
        <div>
          <span className="k">// LOG</span>
          <h2>操作记录</h2>
        </div>
      </div>
      <div className="feed scroll-y">
        {activities.map((activity) => (
          <div className="ev" key={activity.id}>
            <time>{formatLogTime(activity.createdAt, today)}</time>
            <p>{activity.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
