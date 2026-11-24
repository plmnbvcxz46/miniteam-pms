import { EmptyState } from "../../../components/patterns/EmptyState";
import { Panel } from "../../../components/patterns/Panel";
import type { BoundDocument } from "../../../shared/types/documents";
import styles from "./DocumentFinal.module.css";
import DocumentFinalItem from "./DocumentFinalItem";

interface DocumentFinalProps {
  docs: BoundDocument[];
  selectedId: number | null;
  isFiltered: boolean;
  onSelect?: (id: number) => void;
}

export default function DocumentFinal({
  docs,
  selectedId,
  isFiltered,
  onSelect,
}: DocumentFinalProps) {
  return (
    <Panel
      variant="flat"
      kicker="// FINAL"
      title="定稿"
      className={styles.panel}
      headerRight={<span className={styles.count}>{docs.length}</span>}
    >
      {docs.length === 0 ? (
        <EmptyState
          variant="compact"
          description={isFiltered ? "没有匹配的定稿文档" : "当前没有定稿文档"}
        />
      ) : (
        <div className={styles.grid} role="listbox" aria-label="定稿的文档">
          {docs.map((doc) => (
            <DocumentFinalItem
              key={doc.id}
              doc={doc}
              isSelected={doc.id === selectedId}
              onSelect={() => onSelect?.(doc.id)}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
