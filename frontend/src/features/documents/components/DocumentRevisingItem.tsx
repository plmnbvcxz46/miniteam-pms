import { Badge } from "../../../components/ui/Badge";
import type { BoundDocument } from "../../../shared/types/documents";
import { getDayOffset, getDocStatus, getTimelinePercent } from "../utils";
import styles from "./DocumentRevisingItem.module.css";

interface TimelineBarProps {
  className: string;
  fromOffset: number;
  toOffset: number;
}

function TimelineBar({ className, fromOffset, toOffset }: TimelineBarProps) {
  const leftPercent = getTimelinePercent(fromOffset);
  const rightPercent = getTimelinePercent(toOffset);

  return (
    <span
      className={`${styles.bar} ${className}`}
      style={{
        left: leftPercent,
        width: `calc(${rightPercent} - ${leftPercent})`,
      }}
    />
  );
}

interface DocumentRevisingItemProps {
  doc: BoundDocument;
  isSelected: boolean;
  todayOffset: number;
  today: string;
  onSelect?: () => void;
}

export default function DocumentRevisingItem({
  doc,
  isSelected,
  todayOffset,
  today,
  onSelect,
}: DocumentRevisingItemProps) {
  const vd = doc.hist.map((h) => getDayOffset(h.date, today));
  const first = vd.length > 0 ? Math.max(0, Math.min(...vd)) : todayOffset;
  const due = doc.due ? getDayOffset(doc.due, today) + 1 : todayOffset;
  const { status, isLate } = getDocStatus(doc, today);

  const onSegEnd = isLate ? due : todayOffset;

  return (
    <button
      type="button"
      className={styles.row}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <span className={styles.docInfo}>
        <b className={styles.docTitle} title={doc.n}>
          {doc.n}
        </b>
        <small className={styles.docMeta}>
          {doc.taskTitle} · {doc.who}
        </small>
      </span>

      <span className={styles.track} aria-hidden="true">
        <span
          className={styles.cap}
          style={{ left: getTimelinePercent(due) }}
        />
        <TimelineBar
          className={styles.barOn}
          fromOffset={first}
          toOffset={onSegEnd}
        />
        {isLate && (
          <TimelineBar
            className={styles.barOver}
            fromOffset={due}
            toOffset={todayOffset}
          />
        )}
        <span
          className={styles.now}
          style={{ left: getTimelinePercent(todayOffset) }}
        />
        <span
          className={styles.dueLabel}
          data-late={isLate ? "true" : undefined}
          style={{ left: getTimelinePercent(due) }}
        >
          {doc.due ? `截止 ${doc.due}` : "无截止日"}
        </span>
      </span>

      <span className={styles.version}>{doc.v}</span>
      <span className={styles.statusCell}>
        {isLate ? (
          <Badge variant="accent" size="sm">
            {status}
          </Badge>
        ) : (
          <span className={styles.statusText}>{status}</span>
        )}
      </span>
    </button>
  );
}
