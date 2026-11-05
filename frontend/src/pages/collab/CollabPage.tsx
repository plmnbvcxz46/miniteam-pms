import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collabApi } from "../../api/collab";
import { useAccess } from "../../access/useAccess";
import { useMe } from "../../auth/useAuth";
import { useIssue } from "../../issue/useIssue";
import { useProject } from "../../project/useProject";
import type {
  DiscussionDetail,
  DiscussionFormValues,
  MentionValue,
} from "../../types/collab";
import type { Activity } from "../../types/global";
import { useDocumentStore } from "../documents/documentStore";
import { useTaskStore } from "../board/taskStore";
import ThreadDetailPanel from "./components/detail/ThreadDetailPanel";
import NewDiscussionDrawer from "./components/drawer/NewDiscussionDrawer";
import ActivityFeedPanel from "./components/feed/ActivityFeedPanel";
import CollabHeader from "./components/header/CollabHeader";
import ThreadsPanel from "./components/threads/ThreadsPanel";
import {
  activitiesUpTo,
  createDraftFromActivity,
  findCommentIdByActivity,
  findDiscussionIdByActivity,
  formatCollabKicker,
  getTaskDocumentRefs,
  toBrief,
} from "./utils";
import { useCollabData } from "./useCollabData";
import "./css/collab.css";

/** 从任务页跳过来发起讨论时，通过路由 state 带上任务 */
interface CollabLocationState {
  newDiscussionTaskId?: number;
}

/** 通知或任务页点进来要定位的讨论和消息，等数据取到再用 */
interface PendingJump {
  discussionId: number;
  commentId: number;
}

export default function CollabPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskMap, reload: reloadTasks } = useTaskStore();
  const { docs } = useDocumentStore();
  const { user: currentUser } = useMe();
  const { members } = useAccess();
  const { currentProject } = useProject();
  const projectId = currentProject?.id ?? null;
  // 可以 @ 的成员：项目成员里除了自己
  const mentionUsers = useMemo(
    () => members.map((m) => m.user).filter((user) => user.id !== currentUser.id),
    [members, currentUser.id],
  );

  // 讨论和动态来自接口；看过去的期时讨论是那一期快照里的，动态按日期筛
  const { isPast, today } = useIssue();
  const {
    details,
    activities: allActivities,
    ready,
    error,
    missing,
    refresh,
  } = useCollabData();
  const discussionList = useMemo(() => details.map(toBrief), [details]);
  const detailMap = useMemo(() => {
    const map: Record<number, DiscussionDetail> = {};
    for (const detail of details) map[detail.id] = detail;
    return map;
  }, [details]);
  const activityList = useMemo(
    () =>
      isPast
        ? activitiesUpTo(allActivities, new Set(details.map((d) => d.id)), today)
        : allActivities,
    [isPast, allActivities, details, today],
  );

  const [selectedId, setSelectedId] = useState<number>(0);
  const [draftDiscussion, setDraftDiscussion] =
    useState<DiscussionDetail | null>(null);
  // 草稿对话预先放进回复框的内容（文件动态会带上 @ 这份文件）
  const [draftInitial, setDraftInitial] = useState<MentionValue | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);
  const [flashComment, setFlashComment] = useState<{
    commentId: number;
    triggerKey: number;
  } | null>(null);
  // 发起讨论抽屉：为空是关着，lockTask 是从任务页进来、任务不让改
  const [drawer, setDrawer] = useState<{
    taskId: number | null;
    lockTask: boolean;
  } | null>(() => {
    const taskId = (location.state as CollabLocationState | null)
      ?.newDiscussionTaskId;
    return taskId !== undefined ? { taskId, lockTask: true } : null;
  });

  // 路由 state 只用一次，刷新或前进后退不会再弹出抽屉
  useEffect(() => {
    if ((location.state as CollabLocationState | null)?.newDiscussionTaskId) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  // 通知、任务页点进来：/collab?discussionId=&commentId=，选中那个讨论并定位到那条消息，和点击动态是同一套定位。
  // 地址变了先记下要去哪（数据可能还没取到），随后把地址里的参数清掉，刷新或前进后退不会重复定位
  const [seenSearch, setSeenSearch] = useState("");
  const [jumpCount, setJumpCount] = useState(0);
  const [pendingJump, setPendingJump] = useState<PendingJump | null>(null);
  if (location.search !== seenSearch) {
    setSeenSearch(location.search);
    const params = new URLSearchParams(location.search);
    const discussionId = Number(params.get("discussionId"));
    if (discussionId) {
      setPendingJump({
        discussionId,
        commentId: Number(params.get("commentId")),
      });
    }
  }
  if (pendingJump && ready) {
    setPendingJump(null);
    const target = detailMap[pendingJump.discussionId];
    if (target) {
      setJumpCount(jumpCount + 1);
      setDraftDiscussion(null);
      setDraftInitial(null);
      setActiveActivityId(null);
      setSelectedId(pendingJump.discussionId);
      setFlashComment(
        pendingJump.commentId &&
          target.comments.some((c) => c.id === pendingJump.commentId)
          ? { commentId: pendingJump.commentId, triggerKey: jumpCount + 1 }
          : null,
      );
    }
  }
  useEffect(() => {
    if (new URLSearchParams(location.search).get("discussionId")) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // 当前展示的讨论详情（草稿会话优先）
  const currentDetail =
    draftDiscussion ??
    detailMap[selectedId] ??
    detailMap[discussionList[0]?.id];

  // 当前讨论所属任务下可以 @ 的文件
  const taskDocuments = useMemo(
    () => getTaskDocumentRefs(currentDetail?.task?.id, taskMap),
    [currentDetail?.task?.id, taskMap],
  );

  // 顶栏 kicker 统计
  const todayActivityCount = useMemo(() => {
    return activityList.filter((act) => act.createdAt.startsWith(today)).length;
  }, [activityList, today]);

  const overdueCount = useMemo(() => {
    return Object.values(detailMap).filter(
      (d) => (d.task?.overdueDays ?? 0) > 0,
    ).length;
  }, [detailMap]);

  const kicker = useMemo(() => {
    return formatCollabKicker(
      discussionList.length,
      todayActivityCount,
      overdueCount,
    );
  }, [discussionList.length, todayActivityCount, overdueCount]);

  // 切换左侧讨论（退出草稿与动态高亮，清空闪烁）
  const handleSelectDiscussion = (id: number) => {
    setDraftDiscussion(null);
    setDraftInitial(null);
    setActiveActivityId(null);
    setSelectedId(id);
    setFlashComment(null);
  };

  // 点击右侧动态项：有对应讨论就跳转并聚焦高亮，没有就打开空草稿并自动绑定任务
  const handleSelectActivity = (activity: Activity) => {
    setActiveActivityId(activity.id);

    const targetDiscussionId = findDiscussionIdByActivity(
      activity,
      discussionList,
      detailMap,
    );

    if (targetDiscussionId !== null) {
      setDraftDiscussion(null);
      setDraftInitial(null);
      setSelectedId(targetDiscussionId);
      const targetDetail = detailMap[targetDiscussionId];
      const commentId = findCommentIdByActivity(activity, targetDetail);
      if (commentId !== null) {
        setFlashComment({ commentId, triggerKey: Date.now() });
      } else {
        setFlashComment(null);
      }
    } else if (!isPast) {
      const { draft, initialValue } = createDraftFromActivity(
        activity,
        currentUser,
        taskMap,
        (documentId) => docs.find((d) => d.id === documentId)?.taskId ?? null,
      );
      setDraftDiscussion(draft);
      setDraftInitial(initialValue);
      setFlashComment(null);
    }
  };

  // 写操作成功后：重新取讨论和动态，任务详情里带着的讨论也要刷新
  const afterWrite = async () => {
    await Promise.all([refresh(), reloadTasks()]);
  };

  // 新建讨论，对应 POST /projects/{projectId}/discussions，成功后选中新讨论。草稿发出第一条消息和抽屉提交共用
  const createDiscussion = async (
    title: string,
    taskId: number | null,
    content: MentionValue,
  ) => {
    if (projectId === null) throw new Error("还没有选中项目");
    const created = await collabApi.createDiscussion(projectId, {
      title,
      taskId: taskId ?? undefined,
      content: content.text,
      mentionIds: content.mentions.map((u) => u.id),
      documentIds: content.documents.map((d) => d.id),
    });
    await afterWrite();
    setDraftDiscussion(null);
    setDraftInitial(null);
    setActiveActivityId(null);
    setFlashComment(null);
    setSelectedId(created.id);
  };

  // 发送回复：失败时抛错，由回复框显示原因
  const handleSendReply = async (value: MentionValue) => {
    if (!currentDetail) return;

    // 1. 若当前处于草稿空对话，发送首条消息时正式转为真对话
    if (draftDiscussion !== null) {
      await createDiscussion(
        draftDiscussion.title,
        draftDiscussion.task?.id ?? null,
        value,
      );
      return;
    }

    // 2. 正常既有讨论追加评论，对应 POST /discussions/{discussionId}/comments
    const created = await collabApi.createComment(currentDetail.id, {
      content: value.text,
      mentionIds: value.mentions.map((u) => u.id),
      documentIds: value.documents.map((d) => d.id),
    });
    await afterWrite();
    setActiveActivityId(null);
    setFlashComment({ commentId: created.id, triggerKey: Date.now() });
  };

  // 抽屉提交：成功后关闭，失败抛错由抽屉显示原因
  const handleCreateDiscussion = async (values: DiscussionFormValues) => {
    await createDiscussion(values.title, values.taskId, values.content);
    setDrawer(null);
  };

  // 点击任务跳转到 /board/task
  const handleTaskClick = (taskId: number) => {
    navigate(`/board/task?id=${taskId}`);
  };

  // 点击消息里的文件标签，跳到文档页并选中这份文档
  const handleOpenDocument = (documentId: number) => {
    navigate(`/documents?id=${documentId}`);
  };

  if (!ready && (error || missing)) {
    return (
      <section className="view" id="view-team" data-view="team">
        <CollabHeader kicker="" />
        <div className="msgs-empty">
          {missing ? "这一期没有存档，看不到当时的讨论" : error}
        </div>
      </section>
    );
  }

  return (
    <section className="view" id="view-team" data-view="team">
      <CollabHeader
        kicker={ready ? kicker : "正在加载…"}
        onCreate={
          isPast ? undefined : () => setDrawer({ taskId: null, lockTask: false })
        }
      />
      <div className="tg">
        <ThreadsPanel
          discussions={discussionList}
          selectedId={draftDiscussion !== null ? -1 : selectedId}
          detailMap={detailMap}
          onSelectDiscussion={handleSelectDiscussion}
        />
        <ThreadDetailPanel
          detail={currentDetail}
          flashComment={flashComment}
          users={mentionUsers}
          taskDocuments={taskDocuments}
          replyInitial={draftDiscussion !== null ? draftInitial : null}
          onTaskClick={handleTaskClick}
          onOpenDocument={handleOpenDocument}
          onSendReply={isPast ? undefined : handleSendReply}
        />
        <ActivityFeedPanel
          activities={activityList}
          discussions={discussionList}
          detailMap={detailMap}
          selectedDiscussionId={selectedId}
          activeActivityId={activeActivityId}
          isDraftActive={draftDiscussion !== null}
          onSelectActivity={handleSelectActivity}
        />
      </div>
      {drawer && (
        <NewDiscussionDrawer
          tasks={taskMap}
          initialTaskId={drawer.taskId}
          lockTask={drawer.lockTask}
          users={mentionUsers}
          onClose={() => setDrawer(null)}
          onSubmit={handleCreateDiscussion}
        />
      )}
    </section>
  );
}
