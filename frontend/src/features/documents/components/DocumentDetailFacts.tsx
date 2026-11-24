import type { BoundDocument } from "../../../shared/types/documents";
import styles from "./DocumentDetail.module.css";

interface DocumentDetailFactsProps {
  doc: BoundDocument;
  status: string;
  isLate: boolean;
  onTaskClick?: (taskId: number) => void;
}

export default function DocumentDetailFacts({
  doc,
  status,
  isLate,
  onTaskClick,
}: DocumentDetailFactsProps) {
  return (
    <dl className={styles.facts}>
      <dt className={styles.factLabel}>关联任务</dt>
      <dd className={styles.factValue}>
        {doc.taskId ? (
          <button
            type="button"
            className={styles.taskLink}
            onClick={() => onTaskClick?.(doc.taskId!)}
          >
            {doc.taskTitle}
          </button>
        ) : (
          doc.taskTitle
        )}
      </dd>
      <dt className={styles.factLabel}>负责人</dt>
      <dd className={styles.factValue}>{doc.who}</dd>
      <dt className={styles.factLabel}>截止</dt>
      <dd className={styles.factValue}>{doc.due || "无"}</dd>
      <dt className={styles.factLabel}>状态</dt>
      <dd className={styles.factValue} data-late={isLate ? "true" : undefined}>
        {status}
      </dd>
    </dl>
  );
}
