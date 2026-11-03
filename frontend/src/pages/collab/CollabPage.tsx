import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  activities as initialActivities,
  collabTodayDate,
  defaultDiscussionId,
  discussionDetails as initialDiscussionDetails,
  discussions as initialDiscussions,
} from "../../data/collab";
import { useMe } from "../../auth/useAuth";
import { users } from "../../data/global";
import type {
  Comment,
  DiscussionBrief,
  DiscussionDetail,
  DiscussionFormValues,
  DiscussionTask,
  MentionValue,
} from "../../types/collab";
import type { Activity } from "../../types/global";
import { useTaskStore } from "../board/taskStore";
import ThreadDetailPanel from "./components/detail/ThreadDetailPanel";
import NewDiscussionDrawer from "./components/drawer/NewDiscussionDrawer";
import ActivityFeedPanel from "./components/feed/ActivityFeedPanel";
import CollabHeader from "./components/header/CollabHeader";
import ThreadsPanel from "./components/threads/ThreadsPanel";
import {
  createDraftFromActivity,
  findCommentIdByActivity,
  findDiscussionIdByActivity,
  formatCollabKicker,
  getTaskDocumentRefs,
  toDiscussionTask,
} from "./utils";
import "./css/collab.css";

/** 从任务页跳过来发起讨论时，通过路由 state 带上任务 */
interface CollabLocationState {
  newDiscussionTaskId?: number;
}

export default function CollabPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskMap } = useTaskStore();
  const { user: currentUser } = useMe();
  // 可以 @ 的成员：项目成员里除了自己
  const mentionUsers = useMemo(
    () => Object.values(users).filter((user) => user.id !== currentUser.id),
    [currentUser.id],
  );

  // 顶层状态
  const [discussionList, setDiscussionList] =
    useState<DiscussionBrief[]>(initialDiscussions);
  const [detailMap, setDetailMap] = useState<Record<number, DiscussionDetail>>(
    initialDiscussionDetails,
  );
  const [activityList, setActivityList] =
    useState<Activity[]>(initialActivities);
  const [selectedId, setSelectedId] = useState<number>(defaultDiscussionId);
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

  // 通知点进来：/collab?discussionId=&commentId=，选中那个讨论并定位到那条消息，和点击动态是同一套定位。
  // 地址变了就在渲染时调整状态，随后把地址里的参数清掉，刷新或前进后退不会重复定位
  const [seenSearch, setSeenSearch] = useState("");
  const [jumpCount, setJumpCount] = useState(0);
  if (location.search !== seenSearch) {
    setSeenSearch(location.search);
    const params = new URLSearchParams(location.search);
    const discussionId = Number(params.get("discussionId"));
    const commentId = Number(params.get("commentId"));
    if (discussionId && detailMap[discussionId]) {
      setJumpCount(jumpCount + 1);
      setDraftDiscussion(null);
      setDraftInitial(null);
      setActiveActivityId(null);
      setSelectedId(discussionId);
      setFlashComment(
        commentId &&
          detailMap[discussionId].comments.some((c) => c.id === commentId)
          ? { commentId, triggerKey: jumpCount + 1 }
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
  const currentDetail = draftDiscussion ?? detailMap[selectedId];

  // 当前讨论所属任务下可以 @ 的文件
  const taskDocuments = useMemo(
    () => getTaskDocumentRefs(currentDetail?.task?.id, taskMap),
    [currentDetail?.task?.id, taskMap],
  );

  // 顶栏 kicker 统计
  const todayActivityCount = useMemo(() => {
    return activityList.filter(
      (act) =>
        act.createdAt.startsWith(collabTodayDate) ||
        act.createdAt === "刚刚" ||
        act.createdAt.endsWith("刚刚"),
    ).length;
  }, [activityList]);

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
    } else {
      const { draft, initialValue } = createDraftFromActivity(
        activity,
        currentUser,
        taskMap,
      );
      setDraftDiscussion(draft);
      setDraftInitial(initialValue);
      setFlashComment(null);
    }
  };

  const toComment = (value: MentionValue): Comment => ({
    id: Date.now(),
    user: currentUser,
    content: value.text,
    mentions: value.mentions,
    documents: value.documents,
    createdAt: `${collabTodayDate} 刚刚`,
  });

  // 新建讨论：加进列表、选中、追加一条“发起讨论”动态。草稿发出第一条消息和抽屉提交共用
  const createDiscussion = (
    title: string,
    task: DiscussionTask | null,
    creator: DiscussionDetail["creator"],
    comment: Comment,
  ) => {
    const newId = Math.max(0, ...discussionList.map((d) => d.id)) + 1;

    setDetailMap((prev) => ({
      ...prev,
      [newId]: {
        id: newId,
        title,
        creator,
        createdAt: comment.createdAt,
        task,
        comments: [comment],
      },
    }));

    const newBrief: DiscussionBrief = {
      id: newId,
      title,
      task: task
        ? { id: task.id, taskNo: task.taskNo, title: task.title }
        : null,
      commentCount: 1,
      lastCommentAt: "刚刚",
    };
    setDiscussionList((prev) => [newBrief, ...prev]);
    setDraftDiscussion(null);
    setDraftInitial(null);
    setActiveActivityId(null);
    setFlashComment(null);
    setSelectedId(newId);

    const newActivity: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "DISCUSSION",
      targetId: newId,
      action: "CREATE",
      detail: `${currentUser.realName} 发起讨论 <b>${title}</b>`,
      createdAt: "刚刚",
    };
    setActivityList((prev) => [newActivity, ...prev]);
  };

  // 发送回复
  const handleSendReply = (value: MentionValue) => {
    if (!currentDetail) return;

    const newComment = toComment(value);

    // 1. 若当前处于草稿空对话，发送首条消息时正式转为真对话
    if (draftDiscussion !== null) {
      createDiscussion(
        draftDiscussion.title,
        draftDiscussion.task,
        draftDiscussion.creator,
        newComment,
      );
      return;
    }

    // 2. 正常既有讨论追加评论
    setDetailMap((prev) => {
      const cur = prev[selectedId];
      if (!cur) return prev;
      return {
        ...prev,
        [selectedId]: {
          ...cur,
          comments: [...cur.comments, newComment],
        },
      };
    });

    setDiscussionList((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              commentCount: item.commentCount + 1,
              lastCommentAt: "刚刚",
            }
          : item,
      ),
    );

    const newActivity: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "DISCUSSION",
      targetId: selectedId,
      action: "COMMENT",
      detail: `${currentUser.realName} 回复了 <b>${currentDetail.title}</b>`,
      createdAt: "刚刚",
    };

    setActivityList((prev) => [newActivity, ...prev]);
  };

  // 抽屉提交：POST /projects/{projectId}/discussions
  const handleCreateDiscussion = (values: DiscussionFormValues) => {
    const task = values.taskId !== null ? taskMap[values.taskId] : undefined;
    createDiscussion(
      values.title,
      task ? toDiscussionTask(task) : null,
      currentUser,
      toComment(values.content),
    );
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

  return (
    <section className="view" id="view-team" data-view="team">
      <CollabHeader
        kicker={kicker}
        onCreate={() => setDrawer({ taskId: null, lockTask: false })}
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
          onSendReply={handleSendReply}
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
