import { useEffect, useState, type ReactNode } from "react";
import { issues } from "../data/global";
import { getProjectToday } from "../utils/date";
import { IssueContext, type IssueState } from "./IssueContext";

const todayIssue =
  issues.find((issue) => issue.issueDate === getProjectToday()) ?? issues[0];

/** 当前查看哪一期；看过去的期时 body 带 past，样式据此去掉悬停和新建入口 */
export default function IssueProvider({ children }: { children: ReactNode }) {
  const [viewing, setViewing] = useState(todayIssue);
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
    setViewing,
    backToToday: () => setViewing(todayIssue),
  };

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
}
