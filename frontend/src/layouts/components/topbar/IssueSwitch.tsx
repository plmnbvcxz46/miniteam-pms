import { useCallback, useRef, useState } from "react";
import { issues } from "../../../data/global";
import {
  formatDayLabel,
  formatFullDate,
  getProjectToday,
} from "../../../utils/date";
import { useDismiss } from "../../useDismiss";

const todayIssue =
  issues.find((issue) => issue.issueDate === getProjectToday()) ?? issues[0];

export default function IssueSwitch() {
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState(todayIssue);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);
  const isPast = viewing.issueNo !== todayIssue.issueNo;

  return (
    <div id="issue-wrap" ref={rootRef}>
      <button
        className={isPast ? "issue past" : "issue"}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <b>第 {viewing.issueNo} 期</b>
        <span>{formatFullDate(viewing.issueDate)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {isPast && (
        <button
          className="back"
          type="button"
          onClick={() => setViewing(todayIssue)}
        >
          回到今天
        </button>
      )}
      {open && (
        <div className="issues">
          <h4>
            ARCHIVE
            <em>{issues.length}</em>
          </h4>
          <div className="list scroll-y">
            {issues.map((issue) => (
              <button
                key={issue.issueNo}
                type="button"
                aria-current={
                  issue.issueNo === viewing.issueNo ? "true" : undefined
                }
                onClick={() => {
                  setViewing(issue);
                  close();
                }}
              >
                <span className="no">第 {issue.issueNo} 期</span>
                <span className={issue.headline ? "hd" : "hd none"}>
                  {issue.headline ?? "当日无头条"}
                </span>
                <span className="dt">
                  {formatDayLabel(issue.issueDate)}
                  {issue.predictedEnd &&
                    ` · 预计 ${formatDayLabel(issue.predictedEnd)} 完工`}
                  {issue.risk && (
                    <span className="late"> · 延期 {issue.delayDays} 天</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
