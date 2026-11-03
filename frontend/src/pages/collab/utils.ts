import { collabTodayDate } from "../../data/collab";
import { docs } from "../../data/documents";
import { taskStatusLabel } from "../../data/global";
import type {
  DiscussionBrief,
  DiscussionDetail,
  DiscussionTask,
  MentionValue,
} from "../../types/collab";
import type {
  Activity,
  DocumentRef,
  UserBrief,
} from "../../types/global";
import type { TaskDetail } from "../../types/task";
import { addDays } from "../../utils/date";

/**
 * 用于左侧讨论列表项底部时间
 * - 若为 "刚刚" 返回 "刚刚"；
 * - 若日期部分等于 todayDate（如 "2026-10-22"）则返回 HH:mm（如 "10:41"）；
 * - 若是前一天（"2026-10-21"）返回 "昨天"；
 * - 其余返回 MM.DD（如 "10.20"、"10.17"）。
 */
export function formatThreadShortTime(
  dateTimeStr: string | null,
  todayDate: string = collabTodayDate,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";

  const prevDate = addDays(todayDate, -1);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");

  const [datePart, timePart = ""] = dateTimeStr.split(" ");

  if (datePart === todayDate || datePart === todayMMDD) {
    return timePart.slice(0, 5) || datePart;
  }
  if (datePart === prevDate || datePart === prevMMDD) {
    return "昨天";
  }

  // 其余返回 MM.DD
  const [m, d] = datePart.split("-").slice(-2);
  if (m && d) {
    return `${m}.${d}`;
  }
  return datePart.replace("-", ".");
}

/**
 * 用于讨论消息与右侧项目动态的时间展示
 * - 若为 "刚刚" 返回 "刚刚"；
 * - 若日期部分等于 todayDate 返回 HH:mm（如 "10:52"）；
 * - 若是前一天返回 "昨天 HH:mm"（如 "昨天 16:20"）；
 * - 其余返回 MM.DD HH:mm（如 "10.20 16:10"）。
 */
export function formatMessageTime(
  dateTimeStr: string,
  todayDate: string = collabTodayDate,
): string {
  if (!dateTimeStr) return "";
  if (dateTimeStr === "刚刚" || dateTimeStr.endsWith("刚刚")) return "刚刚";

  if (!dateTimeStr.includes(" ")) {
    return dateTimeStr;
  }

  const prevDate = addDays(todayDate, -1);
  const todayMMDD = todayDate.split("-").slice(-2).join("-");
  const prevMMDD = prevDate.split("-").slice(-2).join("-");

  const [datePart, timePart = ""] = dateTimeStr.split(" ");
  const hm = timePart.slice(0, 5);

  if (datePart === todayDate || datePart === todayMMDD) {
    return hm;
  }
  if (datePart === prevDate || datePart === prevMMDD) {
    return `昨天 ${hm}`.trim();
  }

  const [m, d] = datePart.split("-").slice(-2);
  if (m && d) {
    return `${m}.${d} ${hm}`.trim();
  }
  return `${datePart.replace("-", ".")} ${hm}`.trim();
}

/**
 * 获取任务状态提示文本
 * 当 task.overdueDays > 0 时返回 `逾期 ${task.overdueDays} 天`，否则返回 taskStatusLabel[task.status]
 */
export function getTaskStatusNote(task: DiscussionTask): string {
  if (task.overdueDays > 0) {
    return `逾期 ${task.overdueDays} 天`;
  }
  return taskStatusLabel[task.status] ?? "";
}

/**
 * 格式化协作页顶部 kicker
 * `${discussionCount} 个讨论 · 今天 ${todayActivityCount} 条动态` + (overdueCount > 0 ? ` · ${overdueCount} 个关联逾期` : "")
 */
export function formatCollabKicker(
  discussionCount: number,
  todayActivityCount: number,
  overdueCount: number,
): string {
  const overduePart = overdueCount > 0 ? ` · ${overdueCount} 个关联逾期` : "";
  return `${discussionCount} 个讨论 · 今天 ${todayActivityCount} 条动态${overduePart}`;
}

export interface RichInlineSegment {
  type: "text" | "em" | "b";
  content: string;
}

/**
 * 将字符串中的 <em>...</em> 或 <b>...</b> 解析为片段数组，
 * 供组件安全渲染为 <em> / <b> React 节点（避免使用 dangerouslySetInnerHTML）
 */
export function parseRichInline(text: string): RichInlineSegment[] {
  if (!text) return [];
  const regex = /<(em|b)>(.*?)<\/\1>/g;
  const result: RichInlineSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    result.push({
      type: match[1] as "em" | "b",
      content: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return result;
}

/**
 * 根据项目动态推导对应的讨论话题 ID
 * - 讨论动态：按讨论 ID 匹配；
 * - 任务动态：匹配该任务下的讨论，有多个时取最近回复的那个；
 * - 文件动态：匹配评论里 @ 过这份文件的讨论，有多个时取最近 @ 的那个；
 * - 都没有则返回 null，由调用方打开空草稿。
 */
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
    const sameTask = discussions.filter(
      (d) => d.task?.id === activity.targetId,
    );
    return (
      pickLatest(sameTask, (d) => parseTimestamp(d.lastCommentAt ?? ""))?.id ??
      null
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

/** 取 score 最大的一项，空数组返回 undefined */
function pickLatest<T>(items: T[], score: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) =>
      best === undefined || score(item) >= score(best) ? item : best,
    undefined,
  );
}

/** 讨论里最近一次 @ 某份文档的评论时间，没有 @ 过返回 null */
function latestDocumentMentionTime(
  detail: DiscussionDetail | undefined,
  documentId: number,
): number | null {
  const times = (detail?.comments ?? [])
    .filter((c) => c.documents.some((doc) => doc.id === documentId))
    .map((c) => parseTimestamp(c.createdAt));
  return times.length > 0 ? Math.max(...times) : null;
}

/**
 * 解析日期时间字符串为时间戳毫秒数
 */
function parseTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  if (dateStr === "刚刚" || dateStr.endsWith("刚刚")) {
    return Date.now();
  }
  const iso = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
  const time = new Date(iso).getTime();
  return isNaN(time) ? 0 : time;
}

/**
 * 根据项目动态在讨论详情中查找最相关的评论消息 ID
 * - 优先级 1（精确时间匹配）：查找同一用户且时间完全吻合（或同为“刚刚”）的评论；
 * - 优先级 2（发起讨论动态）：若是 DISCUSSION 的 CREATE 动作，定位到首条评论；
 * - 优先级 3（最接近时间匹配）：同用户发表的评论中，与动态时间差绝对值最小的那条；
 * - 优先级 4（兜底）：返回最后一条评论。
 */
export function findCommentIdByActivity(
  activity: Activity,
  detail?: DiscussionDetail,
): number | null {
  if (!detail || !detail.comments || detail.comments.length === 0) {
    return null;
  }

  const comments = detail.comments;

  // 文件动态：定位到最近一次 @ 这份文件的评论
  if (activity.targetType === "DOCUMENT" && activity.targetId !== null) {
    const mentioning = comments.filter((c) =>
      c.documents.some((doc) => doc.id === activity.targetId),
    );
    if (mentioning.length > 0) return mentioning[mentioning.length - 1].id;
  }

  // 优先级 1（精确时间匹配）
  if (activity.user) {
    const isActivityJustNow =
      activity.createdAt === "刚刚" || activity.createdAt.endsWith("刚刚");

    if (isActivityJustNow) {
      const justNowComments = comments.filter(
        (c) =>
          c.user.id === activity.user?.id &&
          (c.createdAt === "刚刚" || c.createdAt.endsWith("刚刚")),
      );
      if (justNowComments.length > 0) {
        return justNowComments[justNowComments.length - 1].id;
      }
    } else {
      const exact = comments.find(
        (c) =>
          c.user.id === activity.user?.id && c.createdAt === activity.createdAt,
      );
      if (exact) return exact.id;
    }
  }

  // 优先级 2（若 action === "CREATE" 且 targetType === "DISCUSSION"）
  if (activity.action === "CREATE" && activity.targetType === "DISCUSSION") {
    return comments[0].id;
  }

  // 优先级 3（同用户时间最接近的评论）
  if (activity.user) {
    const userComments = comments.filter(
      (c) => c.user.id === activity.user?.id,
    );
    if (userComments.length > 0) {
      const actTime = parseTimestamp(activity.createdAt);
      let closestComment = userComments[0];
      let minDiff = Math.abs(
        parseTimestamp(closestComment.createdAt) - actTime,
      );

      for (let i = 1; i < userComments.length; i++) {
        const diff = Math.abs(
          parseTimestamp(userComments[i].createdAt) - actTime,
        );
        if (diff < minDiff) {
          minDiff = diff;
          closestComment = userComments[i];
        }
      }
      return closestComment.id;
    }
  }

  // 优先级 4（兜底）
  return comments[comments.length - 1].id;
}

/** 任务详情转成讨论里的关联任务信息 */
export function toDiscussionTask(task: TaskDetail): DiscussionTask {
  return {
    id: task.id,
    taskNo: task.taskNo,
    title: task.title,
    status: task.status,
    overdueDays: task.overdueDays,
  };
}

/**
 * 根据未关联讨论的动态生成草稿空讨论会话（临时负数 ID），并自动绑定任务：
 * - 任务动态：绑定动态对应的任务；
 * - 文件动态：绑定文件所属的任务，回复框里预先放好 @ 这份文件。
 */
export function createDraftFromActivity(
  activity: Activity,
  creator: UserBrief,
  taskMap: Record<number, TaskDetail>,
): { draft: DiscussionDetail; initialValue: MentionValue | null } {
  const match = activity.detail.match(/<b>(.*?)<\/b>/);
  const title = match && match[1] ? match[1].trim() : "新建讨论";

  let taskId: number | null = null;
  if (activity.targetId !== null) {
    if (activity.targetType === "TASK") taskId = activity.targetId;
    else if (activity.targetType === "DOCUMENT") {
      taskId = findDocumentTaskId(activity.targetId);
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
      createdAt: `${collabTodayDate} 刚刚`,
      task: task ? toDiscussionTask(task) : null,
      comments: [],
    },
    initialValue: doc
      ? { text: `@${doc.name} `, mentions: [], documents: [doc] }
      : null,
  };
}

/** 文档所属的任务 ID，没有所属任务返回 null。接通接口后取文档详情里的任务字段 */
export function findDocumentTaskId(documentId: number): number | null {
  return docs.find((item) => item.id === documentId)?.taskId ?? null;
}

/** 任务下可以 @ 的文档，没有任务时为空。接通接口后取 GET /tasks/{taskId} 的 documents */
export function getTaskDocumentRefs(
  taskId: number | null | undefined,
  taskMap: Record<number, TaskDetail>,
): DocumentRef[] {
  if (taskId === null || taskId === undefined) return [];
  return (taskMap[taskId]?.documents ?? []).map(({ id, name }) => ({
    id,
    name,
  }));
}

/** 文字里的 @ 提及片段 */
export interface MentionSegment {
  type: "text" | "user" | "doc";
  content: string;
  id?: number;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 把文字里的 “@名称” 切出来，名称取自评论的 mentions 和 documents，长的名称优先匹配 */
export function splitMentions(
  text: string,
  users: UserBrief[],
  documents: DocumentRef[],
): MentionSegment[] {
  const targets = [
    ...users.map((user) => ({
      type: "user" as const,
      id: user.id,
      name: user.realName,
    })),
    ...documents.map((doc) => ({
      type: "doc" as const,
      id: doc.id,
      name: doc.name,
    })),
  ].sort((a, b) => b.name.length - a.name.length);
  if (targets.length === 0) return [{ type: "text", content: text }];

  const pattern = new RegExp(
    `@(${targets.map((target) => escapeRegExp(target.name)).join("|")})`,
    "g",
  );
  const result: MentionSegment[] = [];
  let lastIndex = 0;
  let matched: RegExpExecArray | null;
  while ((matched = pattern.exec(text)) !== null) {
    if (matched.index > lastIndex) {
      result.push({
        type: "text",
        content: text.slice(lastIndex, matched.index),
      });
    }
    const target = targets.find((item) => item.name === matched![1])!;
    result.push({ type: target.type, id: target.id, content: matched[0] });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push({ type: "text", content: text.slice(lastIndex) });
  }
  return result;
}

/** 发送前整理输入：去掉首尾空白，丢掉文字里已经不存在的 @ 对象 */
export function finalizeMention(value: MentionValue): MentionValue {
  const text = value.text.trim();
  return {
    text,
    mentions: value.mentions.filter((user) =>
      text.includes(`@${user.realName}`),
    ),
    documents: value.documents.filter((doc) => text.includes(`@${doc.name}`)),
  };
}

/**
 * 讨论、评论和动态在某一天的样子：只留那天以前发生的，
 * 评论数和最后评论时间按留下的评论重算，关联的任务还没创建时不再关联
 */
export function getCollabAtDate(
  discussions: DiscussionBrief[],
  details: Record<number, DiscussionDetail>,
  activities: Activity[],
  taskMap: Record<number, TaskDetail>,
  date: string,
) {
  const upTo = (createdAt: string) => createdAt.slice(0, 10) <= date;
  const detailMap: Record<number, DiscussionDetail> = {};
  for (const detail of Object.values(details)) {
    if (!upTo(detail.createdAt)) continue;
    const task = detail.task ? taskMap[detail.task.id] : undefined;
    detailMap[detail.id] = {
      ...detail,
      comments: detail.comments.filter((c) => upTo(c.createdAt)),
      task:
        detail.task && task
          ? { ...detail.task, status: task.status, overdueDays: task.overdueDays }
          : null,
    };
  }
  const briefs = discussions.flatMap((brief) => {
    const detail = detailMap[brief.id];
    if (!detail) return [];
    const last = detail.comments[detail.comments.length - 1];
    return [
      {
        ...brief,
        task: detail.task && { id: detail.task.id, taskNo: detail.task.taskNo, title: detail.task.title },
        commentCount: detail.comments.length,
        lastCommentAt: last?.createdAt ?? detail.createdAt,
      },
    ];
  });
  return {
    discussions: briefs,
    detailMap,
    activities: activities.filter(
      (act) =>
        /^\d{4}-\d{2}-\d{2}/.test(act.createdAt) &&
        upTo(act.createdAt) &&
        (act.targetType !== "DISCUSSION" ||
          (act.targetId !== null && !!detailMap[act.targetId])),
    ),
  };
}
