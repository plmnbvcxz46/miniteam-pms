import { useMemo, type ReactNode } from "react";
import {
  ActivityFeed,
  type ActivityFeedItem,
} from "../../../components/patterns/ActivityFeed";
import { Panel } from "../../../components/patterns/Panel";
import type { DiscussionBrief, DiscussionDetail } from "../../../shared/types/collab";
import type { Activity } from "../../../shared/types/global";
import { findDiscussionIdByActivity } from "../utils/activityLink";
import { formatMessageTime, parseRichInline } from "../utils/format";
import styles from "./ActivityFeedPanel.module.css";

interface ActivityFeedPanelProps {
  activities: Activity[];
  activeActivityId: number | null;
  discussionList: DiscussionBrief[];
  detailMap: Record<number, DiscussionDetail>;
  today: string;
  isPast: boolean;
  onSelectActivity: (activity: Activity) => void;
  className?: string;
}

function renderRichDetail(detail: string): ReactNode {
  return parseRichInline(detail).map((seg, index) => {
    if (seg.type === "em") {
      return (
        <em key={index} className={styles.em}>
          {seg.content}
        </em>
      );
    }
    if (seg.type === "b") {
      return (
        <strong key={index} className={styles.bold}>
          {seg.content}
        </strong>
      );
    }
    return seg.content;
  });
}

export function ActivityFeedPanel({
  activities,
  activeActivityId,
  discussionList,
  detailMap,
  today,
  isPast,
  onSelectActivity,
  className,
}: ActivityFeedPanelProps) {
  const activityById = useMemo(
    () => new Map(activities.map((a) => [a.id, a])),
    [activities],
  );

  const items: ActivityFeedItem[] = useMemo(
    () =>
      activities.map((activity) => {
        const canSwitch =
          findDiscussionIdByActivity(activity, discussionList, detailMap) !==
          null;
        return {
          id: activity.id,
          time: formatMessageTime(activity.createdAt, today),
          content: renderRichDetail(activity.detail),
          title: canSwitch
            ? "点击切换到对应讨论"
            : isPast
              ? undefined
              : "点击发起相关讨论",
        };
      }),
    [activities, detailMap, discussionList, isPast, today],
  );

  return (
    <Panel
      variant="dark"
      kicker="// ACTIVITY"
      title="动态"
      headerRight={<span className={styles.count}>{activities.length}</span>}
      className={className}
    >
      <ActivityFeed
        surface="dark"
        items={items}
        activeId={activeActivityId}
        autoScrollTop
        emptyText="暂无动态"
        className={styles.feed}
        onSelect={(id) => {
          const hit = activityById.get(Number(id));
          if (hit) onSelectActivity(hit);
        }}
      />
    </Panel>
  );
}
