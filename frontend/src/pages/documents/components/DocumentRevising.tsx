import type { DocumentItem } from "../../../types/documents";
import { getDayOffset, getTimelinePercent } from "../utils";
import DocumentRevisingHeader from "./revising/DocumentRevisingHeader";
import DocumentRevisingItem from "./revising/DocumentRevisingItem";

interface DocumentRevisingProps {
  /** 修订中的文档列表 */
  docs: DocumentItem[];
  /** 当前选中的文档 ID */
  selectedId: string | null;
  /** 选中回调 */
  onSelect?: (id: string) => void;
}

export default function DocumentRevising({
  docs,
  selectedId,
  onSelect,
}: DocumentRevisingProps) {
  // 原型基准今日：10.22
  const today = getDayOffset("10.22");

  // 时间轴刻度
  const axisDates = ["10.12", "10.19", "10.26"];

  return (
    <section className="dsec on">
      <DocumentRevisingHeader count={docs.length} />

      <div className="scroll-x">
        <div className="dx">
          <div className="dx-head">
            <span />
            <div className="dx-axis" id="dx-axis">
              {axisDates.map((l) => (
                <span key={l} style={{ left: getTimelinePercent(getDayOffset(l)) }}>
                  {l}
                </span>
              ))}
            </div>
            <span />
            <span />
          </div>

          <div
            className="dx-rows"
            id="docs"
            role="listbox"
            aria-label="修订中的文档"
          >
            {docs.map((doc, k) => (
              <DocumentRevisingItem
                key={doc.id || doc.tid || doc.n}
                doc={doc}
                orderIndex={k}
                isSelected={Boolean(selectedId && doc.id === selectedId)}
                todayOffset={today}
                onSelect={() => doc.id && onSelect?.(doc.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
