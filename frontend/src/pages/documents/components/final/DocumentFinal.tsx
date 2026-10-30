import type { DocumentItem } from "../../../../types/documents";
import DocumentFinalHeader from "./DocumentFinalHeader";
import DocumentFinalItem from "./DocumentFinalItem";

interface DocumentFinalProps {
  /** 定稿文档列表 */
  docs: DocumentItem[];
  /** 当前选中的文档 ID */
  selectedId: string | null;
  /** 选中回调 */
  onSelect?: (id: string) => void;
}

export default function DocumentFinal({
  docs,
  selectedId,
  onSelect,
}: DocumentFinalProps) {
  return (
    <section className="dsec fin">
      <DocumentFinalHeader count={docs.length} />
      <div
        className="dfin"
        id="docs-fin"
        role="listbox"
        aria-label="已定稿的文档"
      >
        {docs.map((doc, k) => (
          <DocumentFinalItem
            key={doc.id || doc.tid || doc.n}
            doc={doc}
            orderIndex={k}
            isSelected={Boolean(selectedId && doc.id === selectedId)}
            onSelect={() => doc.id && onSelect?.(doc.id)}
          />
        ))}
      </div>
    </section>
  );
}

