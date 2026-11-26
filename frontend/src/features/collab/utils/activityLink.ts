import type {
  Comment,
  DiscussionBrief,
  DiscussionDetail,
  DiscussionTask,
  MentionValue,
} from "../../../shared/types/collab";
import type { Activity, DocumentRef, UserBrief } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";

function pickLatest<T>(items: T[], score: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) =>
      best === undefined || score(item) >= score(best) ? item : best,
    undefined,
  );
}

function parseTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  if (dateStr === "刚刚" || dateStr.endsWith("刚刚")) return Date.now();
  const iso = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
  const time = new Date(iso).getTime();
  return isNaN(time) ? 0 : time;
}

function latestDocumentMentionTime(
  detail: DiscussionDetail | undefined,
  documentId: number,
): number | null {
  const times = (detail?.comments ?? [])
    .filter((c) => c.documents.some((doc) => doc.id === documentId))
    .map((c) => parseTimestamp(c.createdAt));
  return times.length > 0 ? Math.max(...times) : null;
}

/** 根据项目动态推导对应的讨论话题 ID */
export function findDiscussionIdByActivity(
  activity: Activity,
  discussions: DiscussionBrief[],
  detailMap: Record<number, DiscussionDetail>,
): number | null {
  if (activity.targetId === null) return null;

  if (activity.targetType === "DISCUSSION") {
    return discussions.find((d) => d.id === activity.targetId)?.id ?? null;
  }
  if (activity.targetType === "TASK") {
    const sameTask = discussions.filter((d) => d.task?.id === activity.targetId);
    return (
      pickLatest(sameTask, (d) => parseTimestamp(d.lastCommentAt ?? ""))?.id ?? null
    );
  }
  if (activity.targetType === "DOCUMENT") {
    const mentioned = discussions
      .map((d) => ({
        id: d.id,
        time: latestDocumentMentionTime(detailMap[d.id], activity.targetId!),
      }))
      .filter((item) => item.time !== null);
    return pickLatest(mentioned, (item) => item.time!)?.id ?? null;
  }
  return null;
}

function isJustNow(time: string): boolean {
  return time === "刚刚" || time.endsWith("刚刚");
}

function findExactUserCommentId(
  comments: Comment[],
  userId: number,
  createdAt: string,
): number | null {
  const hits = isJustNow(createdAt)
    ? comments.filter((c) => c.user.id === userId && isJustNow(c.createdAt))
    : comments.filter((c) => c.user.id === userId && c.createdAt === createdAt);
  return hits.length > 0 ? hits[hits.length - 1].id : null;
}

function findClosestUserCommentId(
  comments: Comment[],
  userId: number,
  createdAt: string,
): number | null {
  const userComments = comments.filter((c) => c.user.id === userId);
  if (userComments.length === 0) return null;
  const actTime = parseTimestamp(createdAt);
  let closest = userComments[0];
  let minDiff = Math.abs(parseTimestamp(closest.createdAt) - actTime);
  for (let i = 1; i < userComments.length; i += 1) {
    const diff = Math.abs(parseTimestamp(userComments[i].createdAt) - actTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = userComments[i];
    }
  }
  return closest.id;
}

/** 根据项目动态在讨论详情中查找最相关的评论消息 ID */
export function findCommentIdByActivity(
  activity: Activity,
  detail?: DiscussionDetail,
): number | null {
  const comments = detail?.comments;
  if (!comments || comments.length === 0) return null;

  if (activity.targetType === "DOCUMENT" && activity.targetId !== null) {
    const mentioning = comments.filter((c) =>
      c.documents.some((doc) => doc.id === activity.targetId),
    );
    if (mentioning.length > 0) return mentioning[mentioning.length - 1].id;
  }

  if (activity.user) {
    const exactId = findExactUserCommentId(
      comments,
      activity.user.id,
      activity.createdAt,
    );
    if (exactId !== null) return exactId;
  }

  if (activity.action === "CREATE" && activity.targetType === "DISCUSSION") {
    return comments[0].id;
  }

  if (activity.user) {
    const closestId = findClosestUserCommentId(
      comments,
      activity.user.id,
      activity.createdAt,
    );
    if (closestId !== null) return closestId;
  }

  return comments[comments.length - 1].id;
}

export function toDiscussionTask(task: TaskDetail): DiscussionTask {
  return {
    id: task.id,
    taskNo: task.taskNo,
    title: task.title,
    status: task.status,
    overdueDays: task.overdueDays,
  };
}

/** 根据未关联讨论的动态生成草稿空讨论会话 */
export function createDraftFromActivity(
  activity: Activity,
  creator: UserBrief,
  taskMap: Record<number, TaskDetail>,
  documentTaskId: (documentId: number) => number | null,
): { draft: DiscussionDetail; initialValue: MentionValue | null } {
  const match = activity.detail.match(/<b>(.*?)<\/b>/);
  const title = match && match[1] ? match[1].trim() : "新建讨论";

  let taskId: number | null = null;
  if (activity.targetId !== null) {
    if (activity.targetType === "TASK") taskId = activity.targetId;
    else if (activity.targetType === "DOCUMENT") {
      taskId = documentTaskId(activity.targetId);
    }
  }
  const task = taskId !== null && taskMap[taskId] ? taskMap[taskId] : null;
  const doc =
    activity.targetType === "DOCUMENT"
      ? getTaskDocumentRefs(task?.id, taskMap).find(
          (item) => item.id === activity.targetId,
        )
      : undefined;

  return {
    draft: {
      id: -activity.id,
      title,
      creator,
      createdAt: "刚刚",
      task: task ? toDiscussionTask(task) : null,
      comments: [],
    },
    initialValue: doc
      ? { text: `@${doc.name} `, mentions: [], documents: [doc] }
      : null,
  };
}

export function getTaskDocumentRefs(
  taskId: number | null | undefined,
  taskMap: Record<number, TaskDetail>,
): DocumentRef[] {
  if (taskId === null || taskId === undefined) return [];
  return (taskMap[taskId]?.documents ?? []).map(({ id, name }) => ({ id, name }));
}

export function activitiesUpTo(
  activities: Activity[],
  discussionIds: Set<number>,
  date: string,
): Activity[] {
  return activities.filter(
    (act) =>
      act.createdAt.slice(0, 10) <= date &&
      (act.targetType !== "DISCUSSION" ||
        (act.targetId !== null && discussionIds.has(act.targetId))),
  );
}

export function toBrief(detail: DiscussionDetail): DiscussionBrief {
  const last = detail.comments[detail.comments.length - 1];
  return {
    id: detail.id,
    title: detail.title,
    task: detail.task && {
      id: detail.task.id,
      taskNo: detail.task.taskNo,
      title: detail.task.title,
    },
    commentCount: detail.comments.length,
    lastCommentAt: last?.createdAt ?? null,
  };
}
