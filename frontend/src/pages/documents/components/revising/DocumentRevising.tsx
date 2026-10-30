import type { DocumentItem } from "../../../../types/documents";
import { getDayOffset, getTimelinePercent } from "../../utils";
import DocumentRevisingHeader from "./DocumentRevisingHeader";
import DocumentRevisingItem from "./DocumentRevisingItem";

interface DocumentRevisingProps {
  /** 修订中的文档列表 */
  docs: DocumentItem[];
  /** 当前选中的文档 ID */
  selectedId: string | null;
  /** 今日基准日期（从假数据快照注入） */
  currentDate?: string;
  /** 选中回调 */
  onSelect?: (id: string) => void;
}

export default function DocumentRevising({
  docs,
  selectedId,
  currentDate = "10.22",
  onSelect,
}: DocumentRevisingProps) {
  // 今日基准偏移
  const today = getDayOffset(currentDate);

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

