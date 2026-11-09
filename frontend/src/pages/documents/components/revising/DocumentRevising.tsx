import type { BoundDocument } from "../../../../shared/types/documents";
import { getAxisDates, getDayOffset, getTimelinePercent } from "../../utils";
import DocumentRevisingHeader from "./DocumentRevisingHeader";
import DocumentRevisingItem from "./DocumentRevisingItem";

interface DocumentRevisingProps {
  /** 修订中的文档列表 */
  docs: BoundDocument[];
  /** 当前选中的文档 ID */
  selectedId: number | null;
  /** 今日基准日期 MM.DD */
  currentDate: string;
  /** 选中回调 */
  onSelect?: (id: number) => void;
}

export default function DocumentRevising({
  docs,
  selectedId,
  currentDate,
  onSelect,
}: DocumentRevisingProps) {
  // 今日基准偏移
  const today = getDayOffset(currentDate);

  // 时间轴刻度
  const axisDates = getAxisDates();

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
                key={doc.id}
                doc={doc}
                orderIndex={k}
                isSelected={doc.id === selectedId}
                todayOffset={today}
                currentDate={currentDate}
                onSelect={() => onSelect?.(doc.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

