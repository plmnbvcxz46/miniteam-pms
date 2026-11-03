import { useContext } from "react";
import { IssueContext, type IssueState } from "./IssueContext";

export function useIssue(): IssueState {
  const state = useContext(IssueContext);
  if (!state) throw new Error("useIssue 必须在 IssueProvider 内使用");
  return state;
}
