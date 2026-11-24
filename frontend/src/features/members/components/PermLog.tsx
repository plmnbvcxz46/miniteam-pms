import {
  ActivityFeed,
  type ActivityFeedItem,
} from "../../../components/patterns/ActivityFeed";
import type { Activity } from "../../../shared/types/global";
import { formatMonthDay } from "../../../shared/utils/date";
import styles from "./PermLog.module.css";

interface PermLogProps {
  logs: Activity[];
}

export default function PermLog({ logs }: PermLogProps) {
  const items: ActivityFeedItem[] = logs.map((log) => ({
    id: log.id,
    time: formatMonthDay(log.createdAt),
    content: log.detail,
    title: log.detail,
  }));

  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.kicker}>// LOGS</span>
        <b className={styles.title}>变更记录</b>
      </div>
      <ActivityFeed
        items={items}
        surface="light"
        columns={2}
        truncate
        autoScrollTop
        emptyText="暂无变更记录"
        className={styles.feed}
      />
    </section>
  );
}
