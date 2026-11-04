import { useEffect, useMemo, useState, type ReactNode } from "react";
import { projectApi } from "../api/project";
import { useProject } from "../project/useProject";
import type { IssueSummary } from "../types/global";
import { addDays, getLocalToday } from "../utils/date";
import { IssueContext, type IssueState } from "./IssueContext";

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

  useEffect(() => {
    document.body.classList.toggle("past", isPast);
    return () => document.body.classList.remove("past");
  }, [isPast]);

  const value: IssueState = {
    issues,
    viewing,
    isPast,
    today: viewing.issueDate,
    setViewing: (issue) => {
      if (projectId !== null) setPicked({ projectId, issueNo: issue.issueNo });
    },
    backToToday: () => setPicked(null),
  };

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
}
