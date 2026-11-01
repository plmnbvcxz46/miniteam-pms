import { useEffect, useRef } from "react";
import type { Comment, DiscussionDetail } from "../../../../types/collab";
import MessageItem from "./MessageItem";
import ReplyForm from "./ReplyForm";
import ThreadTaskMeta from "./ThreadTaskMeta";

interface ThreadDetailPanelProps {
  detail?: DiscussionDetail;
  onTaskClick?: (taskId: number) => void;
  onSendReply: (content: string) => void;
}

export default function ThreadDetailPanel({
  detail,
  onTaskClick,
  onSendReply,
}: ThreadDetailPanelProps) {
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [detail?.id, detail?.comments.length]);

  return (
    <section className="pnl flat" id="thread">
      <div className="phd">
        <div>
          <span className="k">// DISCUSSION</span>
          <h2 id="th-title">{detail?.title ?? "暂无讨论"}</h2>
        </div>
      </div>
      {detail && (
        <ThreadTaskMeta task={detail.task} onTaskClick={onTaskClick} />
      )}
      <div className="msgs scroll-y" id="msgs" ref={msgsRef}>
        {detail?.comments.map((comment: Comment) => (
          <MessageItem key={comment.id} comment={comment} />
        ))}
      </div>
      <ReplyForm onSend={onSendReply} />
    </section>
  );
}
