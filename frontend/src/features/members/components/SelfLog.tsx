import {
  ActivityFeed,
  type ActivityFeedItem,
} from "../../../components/patterns/ActivityFeed";
import { Panel } from "../../../components/patterns/Panel";
import type { Activity } from "../../../shared/types/global";
import { formatMonthDay } from "../../../shared/utils/date";
import styles from "./SelfLog.module.css";

interface SelfLogProps {
  logs: Activity[];
}

export default function SelfLog({ logs }: SelfLogProps) {
  const items: ActivityFeedItem[] = logs.map((log) => ({
    id: log.id,
    time: formatMonthDay(log.createdAt),
    content: log.detail,
    title: log.detail,
  }));

  return (
    <Panel kicker="// LOGS" title="变更记录">
      <ActivityFeed
        items={items}
        surface="light"
        columns={1}
        truncate
        emptyText="—"
        className={styles.feed}
      />
    </Panel>
  );
}
