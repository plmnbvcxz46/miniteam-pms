import React from "react";
import { docs } from "../../../data/documents";

interface DocumentFinalProps {
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

export default function DocumentFinal({
  selectedIndex = 2,
  onSelect,
}: DocumentFinalProps) {
  // 定稿的文档（包含原数组索引）
  const finalDocs = docs
    .map((d, index) => ({ doc: d, index }))
    .filter(({ doc }) => !!doc.final);

  return (
    <section className="dsec fin">
      <header className="dsec-h">
        <div>
          <span className="k">// FINAL</span>
          <h3>定稿</h3>
        </div>
        <span className="count" id="dc-fin">
          {finalDocs.length}
        </span>
      </header>
      <div
        className="dfin"
        id="docs-fin"
        role="listbox"
        aria-label="已定稿的文档"
      >
        {finalDocs.map(({ doc, index }, k) => {
          const isSelected = index === selectedIndex;
          const taskLabel = doc.task === "—" ? "项目文档" : doc.task;

          return (
            <button
              key={doc.tid || doc.n}
              type="button"
              className="df"
              role="option"
              data-i={index}
              style={{ "--i": k } as React.CSSProperties}
              aria-selected={isSelected}
              onClick={() => onSelect?.(index)}
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
        })}
      </div>
    </section>
  );
}
