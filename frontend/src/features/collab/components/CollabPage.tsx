import { PageState } from "../../../components/patterns/PageState";
import { useCollabPage } from "../hooks/useCollabPage";
import { ActivityFeedPanel } from "./ActivityFeedPanel";
import { CollabHeader } from "./CollabHeader";
import styles from "./CollabPage.module.css";
import { NewDiscussionDrawer } from "./NewDiscussionDrawer";
import { ThreadDetailPanel } from "./ThreadDetailPanel";
import { ThreadsPanel } from "./ThreadsPanel";

function CollabColumns({
  page,
  emptyHint,
}: {
  page: ReturnType<typeof useCollabPage>;
  emptyHint: string;
}) {
  return (
    <div className={styles.cols}>
      <ThreadsPanel
        discussions={page.discussionList}
        detailMap={page.detailMap}
        selectedId={page.selectedThreadId}
        emptyHint={emptyHint}
        today={page.today}
        onSelect={page.handleSelectDiscussion}
        className={styles.colThreads}
      />
      <ThreadDetailPanel
        detail={page.currentDetail}
        isDraft={page.isDraftActive}
        isPast={page.isPast}
        ready={page.ready}
        mentionUsers={page.mentionUsers}
        taskDocuments={page.taskDocuments}
        today={page.today}
        flashComment={page.flashComment}
        draftInitial={page.draftInitial}
        onTaskClick={page.handleTaskClick}
        onOpenDocument={page.handleOpenDocument}
        onSendReply={page.handleSendReply}
        className={styles.colDetail}
      />
      <ActivityFeedPanel
        activities={page.activityList}
        activeActivityId={page.activeActivityId}
        discussionList={page.discussionList}
        detailMap={page.detailMap}
        today={page.today}
        isPast={page.isPast}
        onSelectActivity={page.handleSelectActivity}
        className={styles.colActivity}
      />
    </div>
  );
}

export function CollabPage() {
  const page = useCollabPage();

  if (page.error || page.missing) {
    return (
      <PageState
        status={page.error ? "error" : "missing"}
        kicker="// COLLAB"
        title="团队"
        accentTitle="协作"
        description={page.error || "该期次下暂无团队协作快照"}
        onRetry={
          page.error
            ? () => {
                void page.refresh();
              }
            : undefined
        }
      />
    );
  }

  const emptyHint = !page.ready
    ? "正在加载…"
    : page.isPast
      ? "截至这一天还没有讨论"
      : "还没有讨论，点右上角发起";

  return (
    <div className={styles.page}>
      <CollabHeader
        kicker={page.kicker}
        isPast={page.isPast}
        onOpenNew={() => page.setDrawer({ taskId: null, lockTask: false })}
      />
      <CollabColumns page={page} emptyHint={emptyHint} />
      {page.drawer !== null && (
        <NewDiscussionDrawer
          open
          onOpenChange={(open) => {
            if (!open) page.setDrawer(null);
          }}
          initialTaskId={page.drawer.taskId}
          lockTask={page.drawer.lockTask}
          tasks={page.taskMap}
          mentionUsers={page.mentionUsers}
          onSubmit={page.handleCreateDiscussion}
        />
      )}
    </div>
  );
}
