import {
  ActivityFeed,
  type ActivityFeedItem,
} from "../../../components/patterns/ActivityFeed";
import { Panel } from "../../../components/patterns/Panel";
import type { Activity } from "../../../shared/types/global";
import { formatLogTime } from "../utils";
import styles from "./TaskLogPanel.module.css";

interface TaskLogPanelProps {
  activities: Activity[];
  today: string;
}

export default function TaskLogPanel({ activities, today }: TaskLogPanelProps) {
  const items: ActivityFeedItem[] = activities.map((activity) => ({
    id: activity.id,
    time: formatLogTime(activity.createdAt, today),
    content: activity.detail,
  }));

  return (
    <Panel variant="dark" kicker="// LOG" title="操作记录">
      <ActivityFeed
        surface="dark"
        items={items}
        emptyText="暂无操作记录"
        className={styles.feed}
      />
    </Panel>
  );
}
