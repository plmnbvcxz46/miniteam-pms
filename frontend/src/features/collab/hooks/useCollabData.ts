import { useCallback, useEffect, useState } from "react";
import { collabApi } from "../../../services/collab";
import type { DiscussionDetail } from "../../../shared/types/collab";
import type { Activity } from "../../../shared/types/global";
import { useIssue } from "../../../stores/issue/useIssue";
import { useProject } from "../../../stores/project/useProject";

interface Live {
  projectId: number;
  details: DiscussionDetail[];
  activities: Activity[];
}

async function loadLive(projectId: number): Promise<Omit<Live, "projectId">> {
  const [briefs, activities] = await Promise.all([
    collabApi.listDiscussions(projectId),
    collabApi.listActivities(projectId),
  ]);
  const details = await Promise.all(
    briefs.map((b) => collabApi.getDiscussion(b.id)),
  );
  return { details, activities };
}

export interface CollabData {
  details: DiscussionDetail[];
  activities: Activity[];
  ready: boolean;
  error: string;
  missing: boolean;
  refresh: () => Promise<void>;
}

/** 团队协作数据 hook：看今天调实时接口，看过去的期用快照 */
export function useCollabData(): CollabData {
  const { currentProject } = useProject();
  const { isPast, snapshot, snapshotStatus, snapshotError } = useIssue();
  const projectId = currentProject?.id ?? null;
  const [live, setLive] = useState<Live | null>(null);
  const [failed, setFailed] = useState<{
    projectId: number;
    message: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    if (projectId === null) return;
    const next = await loadLive(projectId);
    setLive({ projectId, ...next });
    setFailed(null);
  }, [projectId]);

  useEffect(() => {
    if (projectId === null) return;
    let alive = true;
    loadLive(projectId)
      .then((next) => {
        if (!alive) return;
        setLive({ projectId, ...next });
        setFailed(null);
      })
      .catch((e: unknown) => {
        if (alive) {
          setFailed({
            projectId,
            message:
              e instanceof Error ? e.message : "数据取失败了，请稍后再试",
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const current = live && live.projectId === projectId ? live : null;
  const activities = current?.activities ?? [];
  const error =
    failed && failed.projectId === projectId && current === null
      ? failed.message
      : "";
  if (isPast) {
    return {
      details: snapshot?.discussions ?? [],
      activities,
      ready: snapshot !== null && current !== null,
      error: snapshotStatus === "error" ? snapshotError : error,
      missing: snapshotStatus === "missing",
      refresh,
    };
  }
  return {
    details: current?.details ?? [],
    activities,
    ready: current !== null,
    error,
    missing: false,
    refresh,
  };
}
