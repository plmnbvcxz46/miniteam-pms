import { useEffect, useRef } from "react";
import type { Comment, DiscussionDetail } from "../../../../types/collab";
import MessageItem from "./MessageItem";
import ReplyForm from "./ReplyForm";
import ThreadTaskMeta from "./ThreadTaskMeta";

interface ThreadDetailPanelProps {
  detail?: DiscussionDetail;
  flashComment?: { commentId: number; triggerKey: number } | null;
  onTaskClick?: (taskId: number) => void;
  onSendReply: (content: string) => void;
}

export default function ThreadDetailPanel({
  detail,
  flashComment,
  onTaskClick,
  onSendReply,
}: ThreadDetailPanelProps) {
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!msgsRef.current) return;

    if (
      flashComment &&
      detail?.comments.some((c) => c.id === flashComment.commentId)
    ) {
      const targetEl = msgsRef.current.querySelector<HTMLElement>(
        `[data-comment-id="${flashComment.commentId}"]`,
      );
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        targetEl.focus({ preventScroll: true });
        return;
      }
    }

    // 默认或普通切换时滚动到底部
    msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [detail?.id, detail?.comments, flashComment]);

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
        {!detail?.comments || detail.comments.length === 0 ? (
          <div className="msgs-empty">
            该动态尚无讨论记录，在下方发送第一条消息即可开启对话
          </div>
        ) : (
          detail.comments.map((comment: Comment) => {
            const isTargetFlash = flashComment?.commentId === comment.id;
            return (
              <MessageItem
                key={
                  isTargetFlash
                    ? `${comment.id}-${flashComment.triggerKey}`
                    : comment.id
                }
                comment={comment}
                isFlashing={isTargetFlash}
              />
            );
          })
        )}
      </div>
      <ReplyForm onSend={onSendReply} autoFocusTrigger={detail?.id} />
    </section>
  );
}
