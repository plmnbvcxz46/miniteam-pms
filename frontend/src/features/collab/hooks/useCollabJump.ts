import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { DiscussionDetail } from "../../../shared/types/collab";

interface CollabLocationState {
  newDiscussionTaskId?: number;
}

interface PendingJump {
  discussionId: number;
  commentId: number;
}

interface UseCollabJumpParams {
  ready: boolean;
  detailMap: Record<number, DiscussionDetail>;
  onResolveJump: (discussionId: number, commentId: number | null) => void;
}

/** 消费一次性的路由跳转参数（?discussionId=&commentId=）与新建讨论任务 state */
export function useCollabJump({
  ready,
  detailMap,
  onResolveJump,
}: UseCollabJumpParams) {
  const navigate = useNavigate();
  const location = useLocation();

  const [initialDrawer] = useState<{
    taskId: number | null;
    lockTask: boolean;
  } | null>(() => {
    const taskId = (location.state as CollabLocationState | null)
      ?.newDiscussionTaskId;
    return taskId !== undefined ? { taskId, lockTask: true } : null;
  });

  useEffect(() => {
    if ((location.state as CollabLocationState | null)?.newDiscussionTaskId) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const [seenSearch, setSeenSearch] = useState("");
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
      const hasComment =
        Boolean(pendingJump.commentId) &&
        target.comments.some((c) => c.id === pendingJump.commentId);
      onResolveJump(
        pendingJump.discussionId,
        hasComment ? pendingJump.commentId : null,
      );
    }
  }

  useEffect(() => {
    if (new URLSearchParams(location.search).get("discussionId")) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return initialDrawer;
}
