import type { BoundDocument } from "../../../../shared/types/documents";
import DocumentFinalHeader from "./DocumentFinalHeader";
import DocumentFinalItem from "./DocumentFinalItem";

interface DocumentFinalProps {
  /** 定稿文档列表 */
  docs: BoundDocument[];
  /** 当前选中的文档 ID */
  selectedId: number | null;
  /** 选中回调 */
  onSelect?: (id: number) => void;
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
            key={doc.id}
            doc={doc}
            orderIndex={k}
            isSelected={doc.id === selectedId}
            onSelect={() => onSelect?.(doc.id)}
          />
        ))}
      </div>
    </section>
  );
}

