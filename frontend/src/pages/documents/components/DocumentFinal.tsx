import React from "react";
import type { DocumentItem } from "../../../types/documents";

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
      <header className="dsec-h">
        <div>
          <span className="k">// FINAL</span>
          <h3>定稿</h3>
        </div>
        <span className="count" id="dc-fin">
          {docs.length}
        </span>
      </header>
      <div
        className="dfin"
        id="docs-fin"
        role="listbox"
        aria-label="已定稿的文档"
      >
        {docs.map((doc, k) => {
          const isSelected = Boolean(selectedId && doc.id === selectedId);
          const taskLabel = doc.task === "—" ? "项目文档" : doc.task;

          return (
            <button
              key={doc.id || doc.tid || doc.n}
              type="button"
              className="df"
              role="option"
              data-i={doc.id}
              style={{ "--i": k } as React.CSSProperties}
              aria-selected={isSelected}
              onClick={() => doc.id && onSelect?.(doc.id)}
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
