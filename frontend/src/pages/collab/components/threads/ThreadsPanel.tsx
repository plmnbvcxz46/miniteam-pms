import type {
  DiscussionBrief,
  DiscussionDetail,
} from "../../../../types/collab";
import { formatPadCount } from "../../utils";
import ThreadItem from "./ThreadItem";

interface ThreadsPanelProps {
  discussions: DiscussionBrief[];
  selectedId: number;
  unreadIds: number[];
  detailMap: Record<number, DiscussionDetail>;
  onSelectDiscussion: (id: number) => void;
}

export default function ThreadsPanel({
  discussions,
  selectedId,
  unreadIds,
  detailMap,
  onSelectDiscussion,
}: ThreadsPanelProps) {
  return (
    <section className="pnl flat">
      <div className="phd">
        <div>
          <span className="k">// THREADS</span>
          <h2>全部讨论</h2>
        </div>
        <span className="n" id="th-count">
          {formatPadCount(discussions.length)}
        </span>
      </div>
      <div className="threads scroll-y" id="threads">
        {discussions.map((item) => {
          const isClosed = detailMap[item.id]?.task?.status === "DONE";
          const isUnread = unreadIds.includes(item.id);
          const isSelected = item.id === selectedId;

          return (
            <ThreadItem
              key={item.id}
              discussion={item}
              isSelected={isSelected}
              isUnread={isUnread}
              isClosed={isClosed}
              onClick={() => onSelectDiscussion(item.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
