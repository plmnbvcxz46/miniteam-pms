import { currentIssue } from "../../../data/global";
import { formatFullDate, getProjectToday } from "../../../utils/date";

export default function IssueSwitch() {
  return (
    <div id="issue-wrap">
      <button
        className="issue"
        type="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <b>{currentIssue.issueNo}</b>
        <span>{formatFullDate(getProjectToday())}</span>
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
    </div>
  );
}
