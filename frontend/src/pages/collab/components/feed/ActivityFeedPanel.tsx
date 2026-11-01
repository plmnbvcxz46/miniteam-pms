import type { DiscussionBrief } from "../../../../types/collab";
import type { Activity } from "../../../../types/global";
import { findDiscussionIdByActivity, formatPadCount } from "../../utils";
import ActivityFeedItem from "./ActivityFeedItem";

interface ActivityFeedPanelProps {
  activities: Activity[];
  discussions: DiscussionBrief[];
  selectedDiscussionId: number;
  activeActivityId: number | null;
  isDraftActive: boolean;
  onSelectActivity: (activity: Activity) => void;
}

export default function ActivityFeedPanel({
  activities,
  discussions,
  selectedDiscussionId,
  activeActivityId,
  isDraftActive,
  onSelectActivity,
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
        {activities.map((activity) => {
          const targetDiscussionId = findDiscussionIdByActivity(
            activity,
            discussions,
          );
          const isActive =
            activeActivityId !== null
              ? activity.id === activeActivityId
              : !isDraftActive &&
                targetDiscussionId !== null &&
                targetDiscussionId === selectedDiscussionId;

          return (
            <ActivityFeedItem
              key={activity.id}
              activity={activity}
              targetDiscussionId={targetDiscussionId}
              isActive={isActive}
              onSelectActivity={onSelectActivity}
            />
          );
        })}
      </div>
    </section>
  );
}
