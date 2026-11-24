import type { BoundDocument } from "../../../shared/types/documents";
import { formatDayLabel } from "../../../shared/utils/date";
import { getAxisDates, getDayOffset, getTimelinePercent } from "../utils";
import styles from "./DocumentRevising.module.css";
import DocumentRevisingItem from "./DocumentRevisingItem";

interface DocumentRevisingTimelineProps {
  docs: BoundDocument[];
  selectedId: number | null;
  today: string;
  onSelect?: (id: number) => void;
}

export default function DocumentRevisingTimeline({
  docs,
  selectedId,
  today,
  onSelect,
}: DocumentRevisingTimelineProps) {
  const todayOffset = getDayOffset(formatDayLabel(today), today) + 1;
  const axisDates = getAxisDates(today);

  return (
    <div className={styles.scrollX}>
      <div className={styles.board}>
        <div className={styles.axisRow}>
          <span />
          <div className={styles.axis}>
            {axisDates.map((label) => (
              <span
                key={label}
                className={styles.axisLabel}
                style={{ left: getTimelinePercent(getDayOffset(label, today)) }}
              >
                {label}
              </span>
            ))}
          </div>
          <span />
          <span />
        </div>

        <div className={styles.rows} role="listbox" aria-label="修订中的文档">
          {docs.map((doc) => (
            <DocumentRevisingItem
              key={doc.id}
              doc={doc}
              isSelected={doc.id === selectedId}
              todayOffset={todayOffset}
              today={today}
              onSelect={() => onSelect?.(doc.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
