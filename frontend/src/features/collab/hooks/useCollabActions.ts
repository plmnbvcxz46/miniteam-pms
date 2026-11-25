import type { Dispatch, SetStateAction } from "react";
import { collabApi } from "../../../services/collab";
import type {
  DiscussionBrief,
  DiscussionDetail,
  DiscussionFormValues,
  MentionValue,
} from "../../../shared/types/collab";
import type { Activity, UserBrief } from "../../../shared/types/global";
import type { DocumentItem } from "../../../shared/types/documents";
import type { TaskDetail } from "../../../shared/types/task";
import {
  createDraftFromActivity,
  findCommentIdByActivity,
  findDiscussionIdByActivity,
} from "../utils/activityLink";

export interface FlashTarget {
  commentId: number;
  triggerKey: number;
}

export interface CollabActionContext {
  projectId: number | null;
  isPast: boolean;
  currentUser: UserBrief;
  taskMap: Record<number, TaskDetail>;
  docs: DocumentItem[];
  discussionList: DiscussionBrief[];
  detailMap: Record<number, DiscussionDetail>;
  currentDetail: DiscussionDetail | undefined;
  draftDiscussion: DiscussionDetail | null;
  refreshData: () => Promise<void>;
  reloadTasks: () => Promise<unknown>;
  setSelectedId: Dispatch<SetStateAction<number>>;
  setDraftDiscussion: Dispatch<SetStateAction<DiscussionDetail | null>>;
  setDraftInitial: Dispatch<SetStateAction<MentionValue | null>>;
  setActiveActivityId: Dispatch<SetStateAction<number | null>>;
  setFlashComment: Dispatch<SetStateAction<FlashTarget | null>>;
  setDrawer: Dispatch<
    SetStateAction<{ taskId: number | null; lockTask: boolean } | null>
  >;
}

async function submitNewDiscussion(
  ctx: CollabActionContext,
  title: string,
  taskId: number | null,
  content: MentionValue,
) {
  if (ctx.projectId === null) throw new Error("还没有选中项目");
  const created = await collabApi.createDiscussion(ctx.projectId, {
    title,
    taskId: taskId ?? undefined,
    content: content.text,
    mentionIds: content.mentions.map((u) => u.id),
    documentIds: content.documents.map((d) => d.id),
  });
  await Promise.all([ctx.refreshData(), ctx.reloadTasks()]);
  ctx.setActiveActivityId(null);
  ctx.setDraftDiscussion(null);
  ctx.setDraftInitial(null);
  ctx.setSelectedId(created.id);
  ctx.setFlashComment(null);
}

/** 构造讨论选择、动态联动与发表评论/发起讨论动作 */
export function useCollabActions(ctx: CollabActionContext) {
  const handleSelectDiscussion = (id: number) => {
    ctx.setActiveActivityId(null);
    ctx.setDraftDiscussion(null);
    ctx.setDraftInitial(null);
    ctx.setSelectedId(id);
    ctx.setFlashComment(null);
  };

  const handleSelectActivity = (activity: Activity) => {
    ctx.setActiveActivityId(activity.id);
    const targetId = findDiscussionIdByActivity(
      activity,
      ctx.discussionList,
      ctx.detailMap,
    );
    if (targetId !== null) {
      const commentId = findCommentIdByActivity(
        activity,
        ctx.detailMap[targetId],
      );
      ctx.setDraftDiscussion(null);
      ctx.setDraftInitial(null);
      ctx.setSelectedId(targetId);
      ctx.setFlashComment(
        commentId !== null ? { commentId, triggerKey: Date.now() } : null,
      );
      return;
    }
    if (!ctx.isPast) {
      const { draft, initialValue } = createDraftFromActivity(
        activity,
        ctx.currentUser,
        ctx.taskMap,
        (docId) => ctx.docs.find((d) => d.id === docId)?.taskId ?? null,
      );
      ctx.setDraftDiscussion(draft);
      ctx.setDraftInitial(initialValue);
      ctx.setFlashComment(null);
    }
  };

  const handleSendReply = async (value: MentionValue) => {
    if (!ctx.currentDetail) return;
    if (ctx.draftDiscussion !== null) {
      await submitNewDiscussion(
        ctx,
        ctx.draftDiscussion.title,
        ctx.draftDiscussion.task?.id ?? null,
        value,
      );
      return;
    }
    const created = await collabApi.createComment(ctx.currentDetail.id, {
      content: value.text,
      mentionIds: value.mentions.map((u) => u.id),
      documentIds: value.documents.map((d) => d.id),
    });
    await Promise.all([ctx.refreshData(), ctx.reloadTasks()]);
    ctx.setActiveActivityId(null);
    ctx.setFlashComment({ commentId: created.id, triggerKey: Date.now() });
  };

  const handleCreateDiscussion = async (values: DiscussionFormValues) => {
    await submitNewDiscussion(ctx, values.title, values.taskId, values.content);
    ctx.setDrawer(null);
  };

  return {
    handleSelectDiscussion,
    handleSelectActivity,
    handleSendReply,
    handleCreateDiscussion,
  };
}
