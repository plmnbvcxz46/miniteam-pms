import React from "react";
import type { BoundDocument } from "../../../../types/documents";

interface DocumentFinalItemProps {
  doc: BoundDocument;
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
  return (
    <button
      key={doc.id}
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
          {doc.taskTitle} · {doc.who}
        </small>
      </span>
      <span className="fv">
        <b>{doc.v}</b>
        <small>{doc.up} 定稿</small>
      </span>
    </button>
  );
}

