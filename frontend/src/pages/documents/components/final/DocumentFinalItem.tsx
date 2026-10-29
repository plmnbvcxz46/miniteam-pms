import React from "react";
import type { DocumentItem } from "../../../../types/documents";

interface DocumentFinalItemProps {
  doc: DocumentItem;
  orderIndex: number;
  isSelected: boolean;
  onSelect?: () => void;
}

export default function DocumentFinalItem({
  doc,
  orderIndex,
  isSelected,
  onSelect,
}: DocumentFinalItemProps) {
  const taskLabel = doc.task === "—" ? "项目文档" : doc.task;

  return (
    <button
      key={doc.id || doc.tid || doc.n}
      type="button"
      className="df"
      role="option"
      data-i={doc.id}
      style={{ "--i": orderIndex } as React.CSSProperties}
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <span className="dn">
        <b>{doc.n}</b>
        <small>
          {taskLabel} · {doc.who}
        </small>
      </span>
      <span className="fv">
        <b>{doc.v}</b>
        <small>{doc.up} 定稿</small>
      </span>
    </button>
  );
}

