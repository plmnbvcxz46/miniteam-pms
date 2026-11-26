import { useEffect, useRef } from "react";
import { Panel } from "../../../components/patterns/Panel";
import type { DiscussionDetail, MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import type { FlashTarget } from "../hooks/useCollabActions";
import { MessageItem } from "./MessageItem";
import { ReplyForm } from "./ReplyForm";
import styles from "./ThreadDetailPanel.module.css";
import { ThreadTaskMeta } from "./ThreadTaskMeta";

interface ThreadDetailPanelProps {
  detail: DiscussionDetail | undefined;
  isDraft: boolean;
  isPast: boolean;
  ready: boolean;
  mentionUsers: UserBrief[];
  taskDocuments: DocumentRef[];
  today: string;
  flashComment: FlashTarget | null;
  draftInitial: MentionValue | null;
  onTaskClick: (taskId: number) => void;
  onOpenDocument: (docId: number) => void;
  onSendReply: (value: MentionValue) => Promise<void>;
  className?: string;
}

function useThreadScroll(
  detail: DiscussionDetail | undefined,
  flashComment: FlashTarget | null,
) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !detail) return;
    if (flashComment) {
      const target = container.querySelector<HTMLElement>(
        `[data-comment-id="${flashComment.commentId}"]`,
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.focus({ preventScroll: true });
        return;
      }
    }
    container.scrollTop = container.scrollHeight;
  }, [detail, flashComment]);

  return scrollRef;
}

function MessageList({
  detail,
  isPast,
  mentionUsers,
  taskDocuments,
  today,
  flashComment,
  onOpenDocument,
  scrollRef,
}: {
  detail: DiscussionDetail;
  isPast: boolean;
  mentionUsers: UserBrief[];
  taskDocuments: DocumentRef[];
  today: string;
  flashComment: FlashTarget | null;
  onOpenDocument: (docId: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={scrollRef} className={styles.messages}>
      {detail.comments.length === 0 ? (
        <div className={styles.emptyMessages}>
          {isPast
            ? "该讨论暂无消息"
            : "在下方输入框发送第一条消息，即可发起该讨论"}
        </div>
      ) : (
        detail.comments.map((comment) => (
          <MessageItem
            key={comment.id}
            comment={comment}
            mentionUsers={mentionUsers}
            taskDocuments={taskDocuments}
            today={today}
            flashTriggerKey={
              flashComment?.commentId === comment.id
                ? flashComment.triggerKey
                : 0
            }
            onOpenDocument={onOpenDocument}
          />
        ))
      )}
    </div>
  );
}

export function ThreadDetailPanel({
  detail,
  isDraft,
  isPast,
  ready,
  mentionUsers,
  taskDocuments,
  today,
  flashComment,
  draftInitial,
  onTaskClick,
  onOpenDocument,
  onSendReply,
  className,
}: ThreadDetailPanelProps) {
  const scrollRef = useThreadScroll(detail, flashComment);

  if (!detail) {
    return (
      <Panel variant="flat" className={className}>
        <div className={styles.empty}>
          {ready ? "暂无讨论，点右上角发起" : "正在加载…"}
        </div>
      </Panel>
    );
  }

  const replyResetKey = isDraft
    ? `draft-${detail.title}-${draftInitial?.text ?? ""}`
    : `thread-${detail.id}`;

  return (
    <Panel
      variant="flat"
      kicker={isDraft ? "// NEW TOPIC" : "// DISCUSSION"}
      title={detail.title}
      className={className}
    >
      {detail.task && (
        <ThreadTaskMeta task={detail.task} onTaskClick={onTaskClick} />
      )}
      <MessageList
        detail={detail}
        isPast={isPast}
        mentionUsers={mentionUsers}
        taskDocuments={taskDocuments}
        today={today}
        flashComment={flashComment}
        onOpenDocument={onOpenDocument}
        scrollRef={scrollRef}
      />
      {!isPast && (
        <ReplyForm
          key={replyResetKey}
          mentionUsers={mentionUsers}
          taskDocuments={taskDocuments}
          placeholder={
            isDraft
              ? "写下讨论的第一条消息，@ 可提及成员和任务下的文件"
              : undefined
          }
          initialValue={draftInitial}
          onSend={onSendReply}
        />
      )}
    </Panel>
  );
}
