import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  activities as initialActivities,
  collabTodayDate,
  defaultDiscussionId,
  discussionDetails as initialDiscussionDetails,
  discussions as initialDiscussions,
} from "../../data/collab";
import { currentUser } from "../../data/global";
import type {
  Comment,
  DiscussionBrief,
  DiscussionDetail,
} from "../../types/collab";
import type { Activity } from "../../types/global";
import ThreadDetailPanel from "./components/detail/ThreadDetailPanel";
import ActivityFeedPanel from "./components/feed/ActivityFeedPanel";
import CollabHeader from "./components/header/CollabHeader";
import ThreadsPanel from "./components/threads/ThreadsPanel";
import {
  createDraftDiscussionFromActivity,
  findCommentIdByActivity,
  findDiscussionIdByActivity,
  formatCollabKicker,
} from "./utils";
import "./css/collab.css";

export default function CollabPage() {
  const navigate = useNavigate();

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
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);
  const [flashComment, setFlashComment] = useState<{
    commentId: number;
    triggerKey: number;
  } | null>(null);

  // 当前展示的讨论详情（草稿会话优先）
  const currentDetail = draftDiscussion ?? detailMap[selectedId];

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
    setActiveActivityId(null);
    setSelectedId(id);
    setFlashComment(null);
  };

  // 点击右侧动态项：若有真对话则跳转并聚焦高亮，若无则打开空草稿对话
  const handleSelectActivity = (activity: Activity) => {
    setActiveActivityId(activity.id);

    const targetDiscussionId = findDiscussionIdByActivity(
      activity,
      discussionList,
    );

    if (targetDiscussionId !== null) {
      setDraftDiscussion(null);
      setSelectedId(targetDiscussionId);
      const targetDetail = detailMap[targetDiscussionId];
      const commentId = findCommentIdByActivity(activity, targetDetail);
      if (commentId !== null) {
        setFlashComment({ commentId, triggerKey: Date.now() });
      } else {
        setFlashComment(null);
      }
    } else {
      const draft = createDraftDiscussionFromActivity(activity, currentUser);
      setDraftDiscussion(draft);
      setFlashComment(null);
    }
  };

  // 发送回复
  const handleSendReply = (content: string) => {
    if (!currentDetail) return;

    const newComment: Comment = {
      id: Date.now(),
      user: currentUser,
      content,
      mentions: [],
      createdAt: `${collabTodayDate} 刚刚`,
    };

    // 1. 若当前处于草稿空对话，发送首条消息时正式转为真对话
    if (draftDiscussion !== null) {
      const newId = Math.max(0, ...discussionList.map((d) => d.id)) + 1;
      const newDetail: DiscussionDetail = {
        ...draftDiscussion,
        id: newId,
        comments: [newComment],
      };

      setDetailMap((prev) => ({
        ...prev,
        [newId]: newDetail,
      }));

      const newBrief: DiscussionBrief = {
        id: newId,
        title: draftDiscussion.title,
        task: draftDiscussion.task
          ? {
              id: draftDiscussion.task.id,
              taskNo: draftDiscussion.task.taskNo,
              title: draftDiscussion.task.title,
            }
          : null,
        commentCount: 1,
        lastCommentAt: "刚刚",
      };

      setDiscussionList((prev) => [newBrief, ...prev]);
      setDraftDiscussion(null);
      setSelectedId(newId);

      const newActivity: Activity = {
        id: Date.now(),
        user: currentUser,
        targetType: "DISCUSSION",
        targetId: newId,
        action: "CREATE",
        detail: `${currentUser.realName} 发起讨论 <b>${draftDiscussion.title}</b>`,
        createdAt: "刚刚",
      };

      setActivityList((prev) => [newActivity, ...prev]);
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

  // 点击任务跳转到 /board/task
  const handleTaskClick = (taskId: number) => {
    void taskId;
    navigate("/board/task");
  };

  return (
    <section className="view" id="view-team" data-view="team">
      <CollabHeader kicker={kicker} />
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
          onTaskClick={handleTaskClick}
          onSendReply={handleSendReply}
        />
        <ActivityFeedPanel
          activities={activityList}
          discussions={discussionList}
          selectedDiscussionId={selectedId}
          activeActivityId={activeActivityId}
          isDraftActive={draftDiscussion !== null}
          onSelectActivity={handleSelectActivity}
        />
      </div>
    </section>
  );
}
