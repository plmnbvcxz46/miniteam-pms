import type {
  DiscussionBrief,
  DiscussionDetail,
} from "../../../../types/collab";
import { formatPadCount } from "../../utils";
import ThreadItem from "./ThreadItem";

interface ThreadsPanelProps {
  discussions: DiscussionBrief[];
  selectedId: number;
  detailMap: Record<number, DiscussionDetail>;
  onSelectDiscussion: (id: number) => void;
  onCreate: () => void;
}

export default function ThreadsPanel({
  discussions,
  selectedId,
  detailMap,
  onSelectDiscussion,
  onCreate,
}: ThreadsPanelProps) {
  return (
    <section className="pnl flat">
      <div className="phd">
        <div>
          <span className="k">// TOPICS</span>
          <h2>讨论话题</h2>
        </div>
        <div className="r">
          <button className="btn" type="button" onClick={onCreate}>
            + 发起讨论
          </button>
          <span className="n" id="th-count">
            {formatPadCount(discussions.length)}
          </span>
        </div>
      </div>
      <div className="threads scroll-y" id="threads">
        {discussions.map((item) => {
          const task = detailMap[item.id]?.task;
          const isClosed = task?.status === "DONE";
          const isSelected = item.id === selectedId;
          const overdueDays = task?.overdueDays ?? 0;

          return (
            <ThreadItem
              key={item.id}
              discussion={item}
              isSelected={isSelected}
              isClosed={isClosed}
              overdueDays={overdueDays}
              onClick={() => onSelectDiscussion(item.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
