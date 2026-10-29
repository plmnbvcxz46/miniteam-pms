import { docs } from "../../../data/documents";
import { getDayOffset, getTimelinePercent } from "../utils";
import DocumentRevisingHeader from "./revising/DocumentRevisingHeader";
import DocumentRevisingItem from "./revising/DocumentRevisingItem";

interface DocumentRevisingProps {
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

export default function DocumentRevising({
  selectedIndex = 2,
  onSelect,
}: DocumentRevisingProps) {
  // 修订中的文档（包含原数组索引）
  const revisingDocs = docs
    .map((d, index) => ({ doc: d, index }))
    .filter(({ doc }) => !doc.final);

  // 原型基准今日：10.22
  const today = getDayOffset("10.22");

  // 时间轴刻度
  const axisDates = ["10.12", "10.19", "10.26"];

  return (
    <section className="dsec on">
      <DocumentRevisingHeader count={revisingDocs.length} />

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
            {revisingDocs.map(({ doc, index }, k) => (
              <DocumentRevisingItem
                key={doc.tid || doc.n}
                doc={doc}
                index={index}
                orderIndex={k}
                isSelected={index === selectedIndex}
                todayOffset={today}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
