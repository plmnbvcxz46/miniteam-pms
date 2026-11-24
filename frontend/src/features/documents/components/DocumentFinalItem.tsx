import type { BoundDocument } from "../../../shared/types/documents";
import styles from "./DocumentFinal.module.css";

interface DocumentFinalItemProps {
  doc: BoundDocument;
  isSelected: boolean;
  onSelect?: () => void;
}

export default function DocumentFinalItem({
  doc,
  isSelected,
  onSelect,
}: DocumentFinalItemProps) {
  return (
    <button
      type="button"
      className={styles.card}
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
      <span className={styles.versionCol}>
        <b className={styles.version}>{doc.v}</b>
        <small className={styles.statusText}>{doc.up} 定稿</small>
      </span>
    </button>
  );
}
