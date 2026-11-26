import { useState } from "react";
import { ActionPopover } from "../../components/patterns/ActionPopover";
import { Button } from "../../components/ui/Button";
import type { IssueSummary } from "../../shared/types/global";
import { formatDayLabel, formatFullDate } from "../../shared/utils/date";
import { useIssue } from "../../stores/issue/useIssue";
import styles from "./IssueSwitch.module.css";

function IssueRow({
  issue,
  currentIssueNo,
  onSelect,
}: {
  issue: IssueSummary;
  currentIssueNo: number;
  onSelect: (issue: IssueSummary) => void;
}) {
  return (
    <button
      type="button"
      className={styles.item}
      aria-current={issue.issueNo === currentIssueNo ? "true" : undefined}
      onClick={() => onSelect(issue)}
    >
      <span className={styles.no}>第 {issue.issueNo} 期</span>
      <span
        className={styles.headline}
        data-empty={issue.headline ? undefined : "true"}
      >
        {issue.headline ?? "当日无头条"}
      </span>
      <span className={styles.date}>
        {formatDayLabel(issue.issueDate)}
        {issue.predictedEnd && ` · 预计 ${formatDayLabel(issue.predictedEnd)} 完工`}
        {issue.risk && (
          <span className={styles.late}> · 延期 {issue.delayDays} 天</span>
        )}
      </span>
    </button>
  );
}

export default function IssueSwitch() {
  const [open, setOpen] = useState(false);
  const {
    issues,
    viewing,
    isPast,
    setViewing,
    backToToday,
    snapshotStatus,
    snapshotError,
  } = useIssue();

  return (
    <div className={styles.wrap} id="issue-wrap">
      <ActionPopover
        open={open}
        onOpenChange={setOpen}
        title="ARCHIVE"
        meta={issues.length}
        width="lg"
        align="start"
        trigger={
          <button
            className={styles.trigger}
            data-past={isPast ? "true" : undefined}
            type="button"
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
        }
      >
        {issues.map((issue) => (
          <IssueRow
            key={issue.issueNo}
            issue={issue}
            currentIssueNo={viewing.issueNo}
            onSelect={(picked) => {
              setViewing(picked);
              setOpen(false);
            }}
          />
        ))}
      </ActionPopover>

      {snapshotStatus === "missing" && (
        <span className={styles.note}>这一期没有存档</span>
      )}
      {snapshotStatus === "error" && (
        <span className={styles.note} role="alert">
          {snapshotError}
        </span>
      )}
      {isPast && (
        <Button variant="primary" size="lg" onClick={backToToday}>
          回到今天
        </Button>
      )}
    </div>
  );
}
