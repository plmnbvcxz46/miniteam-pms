import { useEffect, useState } from "react";
import { useProject } from "../project/useProject";
import type { IssuePages } from "../../shared/types/progress";
import { useIssue } from "./useIssue";

interface Live<T> {
  projectId: number;
  data: T;
}

export interface IssueData<T> {
  /** 数据：看今天是接口实时取的，看过去的期是那一期快照里的；还没取到为空 */
  data: T | null;
  /** 取失败的原因，已经有数据时为空 */
  error: string;
  /** 看的是过去的期，但这一期没有存档 */
  missing: boolean;
}

/**
 * 页面要的数据：看今天时调用 load 取实时接口，任务有变动（version 变了）就重新取；
 * 看过去的期时直接用那一期快照里的 pick 出来的部分。
 * load 要传模块级的稳定函数，不要在组件里现写
 */
export function useIssueData<T>(
  load: (projectId: number) => Promise<T>,
  pick: (pages: IssuePages) => T,
  version: number,
): IssueData<T> {
  const { currentProject } = useProject();
  const { isPast, snapshot, snapshotStatus, snapshotError } = useIssue();
  const projectId = currentProject?.id ?? null;
  const [live, setLive] = useState<Live<T> | null>(null);
  const [failed, setFailed] = useState<{ projectId: number; message: string } | null>(null);

  useEffect(() => {
    if (isPast || projectId === null) return;
    let alive = true;
    load(projectId)
      .then((data) => {
        if (!alive) return;
        setLive({ projectId, data });
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
  }, [isPast, projectId, version, load]);

  if (isPast) {
    return {
      data: snapshot ? pick(snapshot) : null,
      error: snapshotStatus === "error" ? snapshotError : "",
      missing: snapshotStatus === "missing",
    };
  }
  const data = live && live.projectId === projectId ? live.data : null;
  const error = failed && failed.projectId === projectId && data === null ? failed.message : "";
  return { data, error, missing: false };
}
