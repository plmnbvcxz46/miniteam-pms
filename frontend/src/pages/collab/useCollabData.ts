import { useCallback, useEffect, useState } from "react";
import { collabApi } from "../../api/collab";
import { useIssue } from "../../issue/useIssue";
import { useProject } from "../../project/useProject";
import type { DiscussionDetail } from "../../types/collab";
import type { Activity } from "../../types/global";

interface Live {
  projectId: number;
  details: DiscussionDetail[];
  activities: Activity[];
}

/** 取项目里的全部讨论（每个带评论，列表接口不带评论，逐个取详情）和项目动态 */
async function loadLive(projectId: number): Promise<Omit<Live, "projectId">> {
  const [briefs, activities] = await Promise.all([
    collabApi.listDiscussions(projectId),
    collabApi.listActivities(projectId),
  ]);
  const details = await Promise.all(briefs.map((b) => collabApi.getDiscussion(b.id)));
  return { details, activities };
}

export interface CollabData {
  /** 讨论（含评论），最近有回复的在前。看今天是接口取的，看过去的期是那一期快照里的；还没取到为空 */
  details: DiscussionDetail[];
  /** 项目动态，新的在前；过去的期里还没按日期筛 */
  activities: Activity[];
  /** 第一次数据是不是已经取到 */
  ready: boolean;
  /** 取失败的原因，已经有数据时为空 */
  error: string;
  /** 看的是过去的期，但这一期没有存档 */
  missing: boolean;
  /** 重新取一遍，写操作成功后调用，取回来之后才完成 */
  refresh: () => Promise<void>;
}

/**
 * 团队协作页的数据：讨论看今天时来自接口，看过去的期来自那一期快照里的 discussions；
 * 动态一直取接口（动态只增不改），过去的期由页面按日期筛。
 */
export function useCollabData(): CollabData {
  const { currentProject } = useProject();
  const { isPast, snapshot, snapshotStatus, snapshotError } = useIssue();
  const projectId = currentProject?.id ?? null;
  const [live, setLive] = useState<Live | null>(null);
  const [failed, setFailed] = useState<{ projectId: number; message: string } | null>(null);

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
            message: e instanceof Error ? e.message : "数据取失败了，请稍后再试",
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const current = live && live.projectId === projectId ? live : null;
  const activities = current?.activities ?? [];
  const error = failed && failed.projectId === projectId && current === null ? failed.message : "";
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
  return { details: current?.details ?? [], activities, ready: current !== null, error, missing: false, refresh };
}
