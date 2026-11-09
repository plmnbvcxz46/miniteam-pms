import type {
  DiscussionBrief,
  DiscussionDetail,
} from "../../../../types/collab";
import type { Activity } from "../../../../types/global";
import { pad2 } from "../../../../utils/date";
import { findDiscussionIdByActivity } from "../../utils";
import ActivityFeedItem from "./ActivityFeedItem";

interface ActivityFeedPanelProps {
  activities: Activity[];
  discussions: DiscussionBrief[];
  detailMap: Record<number, DiscussionDetail>;
  selectedDiscussionId: number;
  activeActivityId: number | null;
  isDraftActive: boolean;
  onSelectActivity: (activity: Activity) => void;
}

export default function ActivityFeedPanel({
  activities,
  discussions,
  detailMap,
  selectedDiscussionId,
  activeActivityId,
  isDraftActive,
  onSelectActivity,
}: ActivityFeedPanelProps) {
  return (
    <section className="pnl flat dark">
      <div className="phd">
        <div>
          <span className="k t-kicker">// ACTIVITY</span>
          <h2 className="t-section-title">动态</h2>
        </div>
        <span className="n" id="fd-count">
          {pad2(activities.length)}
        </span>
      </div>
      <div className="feed scroll-y" id="feed">
        {activities.map((activity) => {
          const targetDiscussionId = findDiscussionIdByActivity(
            activity,
            discussions,
            detailMap,
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
