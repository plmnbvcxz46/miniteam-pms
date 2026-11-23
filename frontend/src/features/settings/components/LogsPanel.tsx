import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";
import {
  logActionLabel,
  logTargetLabel,
} from "../../../shared/constants/labels";
import { useLogs } from "../hooks/useLogs";
import { groupLogsByDay } from "../logs";
import styles from "./LogsPanel.module.css";

/** 日志：操作日志按天分组，底部“加载更多” */
export function LogsPanel() {
  const { logs, loading, error, hasMore, loadMore } = useLogs();
  const days = groupLogsByDay(logs);

  return (
    <div className={styles.panel}>
      {!loading && !error && days.length === 0 && (
        <p className={styles.note}>没有日志</p>
      )}
      {days.map((day) => (
        <section className={styles.day} key={day.day}>
          <h3 className={styles.dayTitle}>{day.day}</h3>
          {day.items.map((log) => (
            <div className={styles.row} key={log.id}>
              <time className={styles.time}>{log.createdAt.slice(11, 16)}</time>
              <span>{log.user?.realName ?? "系统"}</span>
              <p className={styles.text}>
                {logTargetLabel[log.targetType] ?? log.targetType} ·{" "}
                {logActionLabel[log.action] ?? log.action}
                {log.detail && <em> {log.detail}</em>}
              </p>
              <b className={styles.ip}>{log.ip}</b>
            </div>
          ))}
        </section>
      ))}
      {loading && (
        <p className={styles.note}>
          <Spinner size="sm" /> 加载中…
        </p>
      )}
      {error && (
        <Alert variant="inline" tone="danger">
          {error}
        </Alert>
      )}
      {!loading && hasMore && (
        <div>
          <Button onClick={() => void loadMore()}>加载更多</Button>
        </div>
      )}
    </div>
  );
}
