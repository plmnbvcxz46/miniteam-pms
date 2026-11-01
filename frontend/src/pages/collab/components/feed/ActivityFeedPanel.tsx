import type { Activity } from "../../../../types/global";
import { formatPadCount } from "../../utils";
import ActivityFeedItem from "./ActivityFeedItem";

interface ActivityFeedPanelProps {
  activities: Activity[];
}

export default function ActivityFeedPanel({
  activities,
}: ActivityFeedPanelProps) {
  return (
    <section className="pnl flat dark">
      <div className="phd">
        <div>
          <span className="k">// ACTIVITY</span>
          <h2>动态</h2>
        </div>
        <span className="n" id="fd-count">
          {formatPadCount(activities.length)}
        </span>
      </div>
      <div className="feed scroll-y" id="feed">
        {activities.map((activity) => (
          <ActivityFeedItem key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
