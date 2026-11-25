import { Panel } from "../../../components/patterns/Panel";
import type { DiscussionBrief, DiscussionDetail } from "../../../shared/types/collab";
import { pad2 } from "../../../shared/utils/date";
import { ThreadItem } from "./ThreadItem";
import styles from "./ThreadsPanel.module.css";

interface ThreadsPanelProps {
  discussions: DiscussionBrief[];
  detailMap: Record<number, DiscussionDetail>;
  selectedId: number;
  emptyHint: string;
  today: string;
  onSelect: (id: number) => void;
  className?: string;
}

export function ThreadsPanel({
  discussions,
  detailMap,
  selectedId,
  emptyHint,
  today,
  onSelect,
  className,
}: ThreadsPanelProps) {
  return (
    <Panel
      variant="flat"
      scrollable
      kicker="// TOPICS"
      title="讨论话题"
      headerRight={
        <span className={styles.count}>{pad2(discussions.length)}</span>
      }
      className={className}
    >
      {discussions.length === 0 ? (
        <div className={styles.empty}>{emptyHint}</div>
      ) : (
        <div className={styles.list}>
          {discussions.map((brief) => (
            <ThreadItem
              key={brief.id}
              brief={brief}
              task={detailMap[brief.id]?.task ?? null}
              active={brief.id === selectedId}
              today={today}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
