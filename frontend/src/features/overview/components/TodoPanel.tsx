import { ListRow } from "../../../components/patterns/ListRow";
import { Panel } from "../../../components/patterns/Panel";
import { taskStatusKey } from "../../../shared/constants/task";
import { pad2 } from "../../../shared/utils/date";
import type { TodoRow } from "../utils";
import styles from "./TodoPanel.module.css";

const MAX_ROWS = 4;

interface TodoPanelProps {
  items: TodoRow[];
  total: number;
  onOpenTask: (taskId: number) => void;
}

export default function TodoPanel({ items, total, onOpenTask }: TodoPanelProps) {
  const overflow = total > MAX_ROWS;
  const shown = items.slice(0, overflow ? MAX_ROWS - 1 : MAX_ROWS);

  return (
    <Panel
      variant="flat"
      kicker="// TODAY"
      title="今日待办"
      scrollable
      className={styles.panel}
      headerRight={<span className={styles.count}>{pad2(total)}</span>}
    >
      <div className={styles.list}>
        {shown.map(({ id, title, status, tag, tone }) => {
          const statusKey = status ? taskStatusKey[status] : undefined;
          return (
            <ListRow
              key={id}
              density="compact"
              tone={tone === "late" ? "alert" : "default"}
              onClick={() => onOpenTask(id)}
              leading={
                <span className={styles.statusKey} data-status={statusKey} />
              }
              title={title}
              trailing={
                <span className={styles.tag} data-tone={tone || undefined}>
                  {tag}
                </span>
              }
            />
          );
        })}
        {overflow && (
          <ListRow
            density="compact"
            title={
              <span className={styles.mutedText}>
                还有 {total - shown.length} 项…
              </span>
            }
          />
        )}
        {total === 0 && (
          <ListRow
            density="compact"
            title={<span className={styles.mutedText}>今日无待办任务</span>}
          />
        )}
      </div>
    </Panel>
  );
}
