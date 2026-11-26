import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "../../services/http";
import { projectApi } from "../../services/projects";
import type { IssueSummary, ProjectSummary } from "../../shared/types/global";
import type { IssuePages } from "../../shared/types/progress";
import { addDays, getLocalToday } from "../../shared/utils/date";
import { useProject } from "../project/useProject";
import { IssueContext, type IssueState, type SnapshotStatus } from "./IssueContext";

interface LoadedSnapshot {
  key: string;
  status: Exclude<SnapshotStatus, "idle" | "loading">;
  pages: IssuePages | null;
  error: string;
}

interface LoadedIssues {
  projectId: number;
  list: IssueSummary[];
}

function buildTodayIssue(currentProject: ProjectSummary | null): IssueSummary {
  return {
    issueNo: currentProject?.issueNo ?? 1,
    issueDate: currentProject
      ? addDays(currentProject.startDate, currentProject.issueNo - 1)
      : getLocalToday(),
    headline: currentProject?.headline ?? null,
    predictedEnd: null,
    delayDays: 0,
    risk: false,
  };
}

function useSnapshotState(
  isPast: boolean,
  projectId: number | null,
  issueDate: string,
) {
  const [loadedSnapshot, setLoadedSnapshot] = useState<LoadedSnapshot | null>(null);
  const snapshotKey =
    isPast && projectId !== null ? `${projectId}:${issueDate}` : null;

  useEffect(() => {
    if (snapshotKey === null || projectId === null) return;
    let alive = true;
    projectApi
      .issue(projectId, issueDate)
      .then(
        (data) =>
          alive &&
          setLoadedSnapshot({
            key: snapshotKey,
            status: "ready",
            pages: data.snapshot,
            error: "",
          }),
      )
      .catch((e: unknown) => {
        if (!alive) return;
        const missing = e instanceof ApiError && e.code === 404;
        setLoadedSnapshot({
          key: snapshotKey,
          status: missing ? "missing" : "error",
          pages: null,
          error:
            e instanceof Error ? e.message : "往期数据取失败了，请稍后再试",
        });
      });
    return () => {
      alive = false;
    };
  }, [snapshotKey, projectId, issueDate]);

  const current =
    loadedSnapshot && loadedSnapshot.key === snapshotKey ? loadedSnapshot : null;
  const snapshotStatus: SnapshotStatus =
    snapshotKey === null ? "idle" : (current?.status ?? "loading");

  return { current, snapshotStatus };
}

/** 当前查看哪一期；看过去的期时 body 带 past，样式据此去掉悬停和新建入口 */
export default function IssueProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject();
  const projectId = currentProject?.id ?? null;
  const [loaded, setLoaded] = useState<LoadedIssues | null>(null);
  const [picked, setPicked] = useState<{
    projectId: number;
    issueNo: number;
  } | null>(null);

  useEffect(() => {
    if (projectId === null) return;
    let alive = true;
    projectApi
      .issues(projectId)
      .then((list) => alive && setLoaded({ projectId, list }))
      .catch(() => {
        // 往期列表取不到时只剩今天这一期，不影响其他页面
      });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const todayIssue = useMemo(
    () => buildTodayIssue(currentProject),
    [currentProject],
  );
  const issues = useMemo(
    () => (loaded && loaded.projectId === projectId ? loaded.list : [todayIssue]),
    [loaded, projectId, todayIssue],
  );
  const viewing =
    picked && picked.projectId === projectId
      ? (issues.find((issue) => issue.issueNo === picked.issueNo) ?? todayIssue)
      : todayIssue;
  const isPast = viewing.issueNo !== todayIssue.issueNo;
  const { current, snapshotStatus } = useSnapshotState(
    isPast,
    projectId,
    viewing.issueDate,
  );

  useEffect(() => {
    document.body.classList.toggle("past", isPast);
    return () => document.body.classList.remove("past");
  }, [isPast]);

  const value: IssueState = {
    issues,
    viewing,
    isPast,
    today: viewing.issueDate,
    snapshot: current?.pages ?? null,
    snapshotStatus,
    snapshotError: current?.error ?? "",
    setViewing: (issue) => {
      if (projectId !== null) setPicked({ projectId, issueNo: issue.issueNo });
    },
    backToToday: () => setPicked(null),
  };

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
}
