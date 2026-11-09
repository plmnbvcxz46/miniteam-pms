import { createContext } from "react";
import type { IssueSummary } from "../../shared/types/global";
import type { IssuePages } from "../../shared/types/progress";

/**
 * 过去的期的快照取得怎么样了：idle 不是过去的期；loading 在取；ready 取到了；
 * missing 这一期没有存档（404）；error 取失败（message 是原因）
 */
export type SnapshotStatus = "idle" | "loading" | "ready" | "missing" | "error";

export interface IssueState {
  /** 所有期，按期号倒序，第一项是今天 */
  issues: IssueSummary[];
  /** 正在查看的期 */
  viewing: IssueSummary;
  /** 正在查看的是不是过去的期；过去的期只读 */
  isPast: boolean;
  /** 正在查看的期的日期 yyyy-MM-dd，各页面算逾期、剩余天数都以它为“今天” */
  today: string;
  /** 过去的期的各页面数据（GET /projects/{projectId}/issues/{issueDate}），取到之前、没有存档或看今天时为空 */
  snapshot: IssuePages | null;
  snapshotStatus: SnapshotStatus;
  snapshotError: string;
  setViewing: (issue: IssueSummary) => void;
  backToToday: () => void;
}

export const IssueContext = createContext<IssueState | null>(null);
