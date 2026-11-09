import { useEffect, useMemo, useState, type ReactNode } from "react";
import { projectApi } from "../../api/project";
import { useProject } from "../project/useProject";
import type { IssueSummary } from "../../shared/types/global";
import { addDays, getLocalToday } from "../../shared/utils/date";
import type { IssuePages } from "../../shared/types/progress";
import { ApiError } from "../../api/http";
import { IssueContext, type IssueState, type SnapshotStatus } from "./IssueContext";

/** 某一期快照的取回结果，key 是“项目:日期”，用来判断拿到的是不是当前这一期的 */
interface LoadedSnapshot {
  key: string;
  status: Exclude<SnapshotStatus, "idle" | "loading">;
  pages: IssuePages | null;
  error: string;
}

/** 某个项目的往期列表，用来判断拿到的列表是不是当前项目的 */
interface LoadedIssues {
  projectId: number;
  list: IssueSummary[];
}

/** 当前查看哪一期；看过去的期时 body 带 past，样式据此去掉悬停和新建入口 */
export default function IssueProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject();
  const projectId = currentProject?.id ?? null;
  const [loaded, setLoaded] = useState<LoadedIssues | null>(null);
  // 选中的期号属于哪个项目，换项目后自动回到今天
  const [picked, setPicked] = useState<{ projectId: number; issueNo: number } | null>(null);

  // GET /projects/{projectId}/issues
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

  // 今天这一期不用等列表：期号取自项目，日期是开始日期往后数
  const todayIssue = useMemo<IssueSummary>(
    () => ({
      issueNo: currentProject?.issueNo ?? 1,
      issueDate: currentProject
        ? addDays(currentProject.startDate, currentProject.issueNo - 1)
        : getLocalToday(),
      headline: currentProject?.headline ?? null,
      predictedEnd: null,
      delayDays: 0,
      risk: false,
    }),
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

  // GET /projects/{projectId}/issues/{issueDate}：看过去的期时取那一期的各页面数据
  const [loadedSnapshot, setLoadedSnapshot] = useState<LoadedSnapshot | null>(null);
  const snapshotKey = isPast && projectId !== null ? `${projectId}:${viewing.issueDate}` : null;
  useEffect(() => {
    if (snapshotKey === null || projectId === null) return;
    let alive = true;
    projectApi
      .issue(projectId, viewing.issueDate)
      .then(
        (data) =>
          alive &&
          setLoadedSnapshot({ key: snapshotKey, status: "ready", pages: data.snapshot, error: "" }),
      )
      .catch((e: unknown) => {
        if (!alive) return;
        const missing = e instanceof ApiError && e.code === 404;
        setLoadedSnapshot({
          key: snapshotKey,
          status: missing ? "missing" : "error",
          pages: null,
          error: e instanceof Error ? e.message : "往期数据取失败了，请稍后再试",
        });
      });
    return () => {
      alive = false;
    };
  }, [snapshotKey, projectId, viewing.issueDate]);
  const current = loadedSnapshot && loadedSnapshot.key === snapshotKey ? loadedSnapshot : null;
  const snapshotStatus: SnapshotStatus =
    snapshotKey === null ? "idle" : (current?.status ?? "loading");

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
