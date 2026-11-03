import type { BoundDocument } from "../../../../types/documents";

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
    <dl className="facts" id="doc-facts">
      <dt>关联任务</dt>
      <dd>
        {doc.taskId ? (
          <span
            className="lnk"
            data-t={doc.taskId}
            onClick={() => onTaskClick?.(doc.taskId!)}
          >
            {doc.taskTitle}
          </span>
        ) : (
          doc.taskTitle
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

