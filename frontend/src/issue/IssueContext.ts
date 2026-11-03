import { createContext } from "react";
import type { IssueSummary } from "../types/global";

export interface IssueState {
  /** 所有期，按期号倒序，第一项是今天 */
  issues: IssueSummary[];
  /** 正在查看的期 */
  viewing: IssueSummary;
  /** 正在查看的是不是过去的期；过去的期只读 */
  isPast: boolean;
  /** 正在查看的期的日期 yyyy-MM-dd，各页面算逾期、剩余天数都以它为“今天” */
  today: string;
  setViewing: (issue: IssueSummary) => void;
  backToToday: () => void;
}

export const IssueContext = createContext<IssueState | null>(null);
