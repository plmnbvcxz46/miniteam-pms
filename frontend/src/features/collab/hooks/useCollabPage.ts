import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DiscussionDetail, MentionValue } from "../../../shared/types/collab";
import type { Member } from "../../../shared/types/members";
import { useAccess } from "../../../stores/access/useAccess";
import { useMe } from "../../../stores/auth/useAuth";
import { useDocumentStore } from "../../../stores/document/documentStore";
import { useIssue } from "../../../stores/issue/useIssue";
import { useProject } from "../../../stores/project/useProject";
import { useTaskStore } from "../../../stores/task/taskStore";
import {
  activitiesUpTo,
  getTaskDocumentRefs,
  toBrief,
} from "../utils/activityLink";
import { formatCollabKicker } from "../utils/format";
import { useCollabActions, type FlashTarget } from "./useCollabActions";
import { useCollabData, type CollabData } from "./useCollabData";
import { useCollabJump } from "./useCollabJump";

function useCollabDerived(
  data: CollabData,
  currentUserId: number,
  members: Member[],
  isPast: boolean,
  today: string,
) {
  const mentionUsers = useMemo(
    () => members.map((m) => m.user).filter((u) => u.id !== currentUserId),
    [members, currentUserId],
  );
  const discussionList = useMemo(
    () => data.details.map(toBrief),
    [data.details],
  );
  const detailMap = useMemo(() => {
    const map: Record<number, DiscussionDetail> = {};
    for (const detail of data.details) map[detail.id] = detail;
    return map;
  }, [data.details]);
  const activityList = useMemo(
    () =>
      isPast
        ? activitiesUpTo(
            data.activities,
            new Set(data.details.map((d) => d.id)),
            today,
          )
        : data.activities,
    [isPast, data.activities, data.details, today],
  );
  const todayCount = useMemo(
    () => activityList.filter((a) => a.createdAt.startsWith(today)).length,
    [activityList, today],
  );
  const overdueCount = useMemo(
    () =>
      Object.values(detailMap).filter((d) => (d.task?.overdueDays ?? 0) > 0)
        .length,
    [detailMap],
  );
  const kicker = data.ready
    ? formatCollabKicker(discussionList.length, todayCount, overdueCount)
    : "正在加载…";

  return { mentionUsers, discussionList, detailMap, activityList, kicker };
}

function useCollabSelection(
  ready: boolean,
  detailMap: Record<number, DiscussionDetail>,
) {
  const [selectedId, setSelectedId] = useState(0);
  const [draftDiscussion, setDraftDiscussion] =
    useState<DiscussionDetail | null>(null);
  const [draftInitial, setDraftInitial] = useState<MentionValue | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<number | null>(null);
  const [flashComment, setFlashComment] = useState<FlashTarget | null>(null);
  const [jumpCount, setJumpCount] = useState(0);

  const initialDrawer = useCollabJump({
    ready,
    detailMap,
    onResolveJump: (discussionId, commentId) => {
      const nextCount = jumpCount + 1;
      setJumpCount(nextCount);
      setDraftDiscussion(null);
      setDraftInitial(null);
      setActiveActivityId(null);
      setSelectedId(discussionId);
      setFlashComment(
        commentId ? { commentId, triggerKey: nextCount } : null,
      );
    },
  });
  const [drawer, setDrawer] = useState(initialDrawer);

  return {
    selectedId,
    setSelectedId,
    draftDiscussion,
    setDraftDiscussion,
    draftInitial,
    setDraftInitial,
    activeActivityId,
    setActiveActivityId,
    flashComment,
    setFlashComment,
    drawer,
    setDrawer,
  };
}

export function useCollabPage() {
  const navigate = useNavigate();
  const { taskMap, reload: reloadTasks } = useTaskStore();
  const { docs } = useDocumentStore();
  const { user: currentUser } = useMe();
  const { members } = useAccess();
  const { currentProject } = useProject();
  const { isPast, today } = useIssue();
  const data = useCollabData();
  const derived = useCollabDerived(
    data,
    currentUser.id,
    members,
    isPast,
    today,
  );
  const selection = useCollabSelection(data.ready, derived.detailMap);

  const currentDetail =
    selection.draftDiscussion ??
    derived.detailMap[selection.selectedId] ??
    derived.detailMap[derived.discussionList[0]?.id];

  const taskDocuments = useMemo(
    () => getTaskDocumentRefs(currentDetail?.task?.id, taskMap),
    [currentDetail?.task?.id, taskMap],
  );

  const actions = useCollabActions({
    projectId: currentProject?.id ?? null,
    isPast,
    currentUser,
    taskMap,
    docs,
    discussionList: derived.discussionList,
    detailMap: derived.detailMap,
    currentDetail,
    refreshData: data.refresh,
    reloadTasks,
    ...selection,
  });

  return {
    ready: data.ready,
    error: data.error,
    missing: data.missing,
    refresh: data.refresh,
    isPast,
    today,
    kicker: derived.kicker,
    taskMap,
    mentionUsers: derived.mentionUsers,
    discussionList: derived.discussionList,
    detailMap: derived.detailMap,
    activityList: derived.activityList,
    selectedThreadId:
      selection.draftDiscussion !== null ? -1 : selection.selectedId,
    selectedId: selection.selectedId,
    isDraftActive: selection.draftDiscussion !== null,
    currentDetail,
    taskDocuments,
    draftInitial:
      selection.draftDiscussion !== null ? selection.draftInitial : null,
    activeActivityId: selection.activeActivityId,
    flashComment: selection.flashComment,
    drawer: selection.drawer,
    setDrawer: selection.setDrawer,
    ...actions,
    handleTaskClick: (taskId: number) => navigate(`/board/task?id=${taskId}`),
    handleOpenDocument: (docId: number) => navigate(`/documents?id=${docId}`),
  };
}
