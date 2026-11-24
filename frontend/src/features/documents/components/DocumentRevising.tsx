import { EmptyState } from "../../../components/patterns/EmptyState";
import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import type { BoundDocument } from "../../../shared/types/documents";
import styles from "./DocumentRevising.module.css";
import DocumentRevisingTimeline from "./DocumentRevisingTimeline";

const DOC_REVISING_LEGENDS: readonly LegendItem[] = [
  { key: "inProgress", label: "已进行", swatch: "solid" },
  { key: "overdue", label: "逾期", swatch: "striped" },
  { key: "dueLine", label: "截止日", swatch: "vline-dashed" },
  { key: "todayLine", label: "今天", swatch: "vline-accent" },
];

interface DocumentRevisingProps {
  docs: BoundDocument[];
  selectedId: number | null;
  today: string;
  isFiltered: boolean;
  onSelect?: (id: number) => void;
}

export default function DocumentRevising({
  docs,
  selectedId,
  today,
  isFiltered,
  onSelect,
}: DocumentRevisingProps) {
  return (
    <Panel
      variant="flat"
      kicker="// REVISING"
      title="修订中"
      className={styles.panel}
      headerRight={
        <div className={styles.headerMeta}>
          <Legend items={DOC_REVISING_LEGENDS} />
          <span className={styles.count}>{docs.length}</span>
        </div>
      }
    >
      {docs.length === 0 ? (
        <EmptyState
          variant="compact"
          description={
            isFiltered ? "没有匹配的修订中文档" : "当前没有修订中的文档"
          }
        />
      ) : (
        <DocumentRevisingTimeline
          docs={docs}
          selectedId={selectedId}
          today={today}
          onSelect={onSelect}
        />
      )}
    </Panel>
  );
}
