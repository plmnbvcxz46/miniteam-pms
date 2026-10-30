import type { DocumentItem } from "../../../../types/documents";

interface DocumentDetailFactsProps {
  doc: DocumentItem;
  status: string;
  isLate: boolean;
  onTaskClick?: (taskId: string) => void;
}

export default function DocumentDetailFacts({
  doc,
  status,
  isLate,
  onTaskClick,
}: DocumentDetailFactsProps) {
  return (
    <dl className="facts" id="doc-facts">
      <dt>关联任务</dt>
      <dd>
        {doc.tid ? (
          <span
            className="lnk"
            data-t={doc.tid}
            onClick={() => onTaskClick?.(doc.tid!)}
          >
            {doc.task}
          </span>
        ) : (
          doc.task || "—"
        )}
      </dd>
      <dt>负责人</dt>
      <dd>{doc.who}</dd>
      <dt>截止</dt>
      <dd>{doc.due}</dd>
      <dt>状态</dt>
      <dd className={isLate ? "late" : ""}>{status}</dd>
    </dl>
  );
}

