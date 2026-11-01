import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  activities as initialActivities,
  collabTodayDate,
  defaultDiscussionId,
  discussionDetails as initialDiscussionDetails,
  discussions as initialDiscussions,
  initialUnreadIds,
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
import { formatCollabKicker } from "./utils";
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
  const [unreadIds, setUnreadIds] = useState<number[]>(initialUnreadIds);

  // 当前选中讨论的详情
  const currentDetail = detailMap[selectedId];

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

  // 切换选中讨论并消除未读
  const handleSelectDiscussion = (id: number) => {
    setSelectedId(id);
    setUnreadIds((prev) => prev.filter((unreadId) => unreadId !== id));
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

    // 1. 追加到当前讨论的 comments 列表
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

    // 2. 更新左侧讨论列表项的评论数和最新回复时间
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

    // 3. 追加一条动态至右侧列表顶部
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
          selectedId={selectedId}
          unreadIds={unreadIds}
          detailMap={detailMap}
          onSelectDiscussion={handleSelectDiscussion}
        />
        <ThreadDetailPanel
          detail={currentDetail}
          onTaskClick={handleTaskClick}
          onSendReply={handleSendReply}
        />
        <ActivityFeedPanel activities={activityList} />
      </div>
    </section>
  );
}
