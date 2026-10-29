import React from "react";
import type { DocumentItem } from "../../../../types/documents";
import { getDayOffset, getTimelinePercent, getDocStatus } from "../../utils";

interface TimelineBarProps {
  /** 样式类名，如 "b on"、"b over" */
  className?: string;
  /** 起始偏移量（天数） */
  fromOffset: number;
  /** 终止偏移量（天数） */
  toOffset: number;
}

/**
 * 甘特图单段进度条组件（内部复用）
 * 输入起始和终止偏移天数，自动计算百分比 left 与 width
 */
function TimelineBar({ className = "b on", fromOffset, toOffset }: TimelineBarProps) {
  const leftPercent = getTimelinePercent(fromOffset);
  const rightPercent = getTimelinePercent(toOffset);

  return (
    <i
      className={className}
      style={{
        left: leftPercent,
        width: `calc(${rightPercent} - ${leftPercent})`,
      }}
    />
  );
}

interface DocumentRevisingItemProps {
  doc: DocumentItem;
  index: number;
  orderIndex: number;
  isSelected: boolean;
  todayOffset: number;
  onSelect?: (index: number) => void;
}

export default function DocumentRevisingItem({
  doc,
  index,
  orderIndex,
  isSelected,
  todayOffset,
  onSelect,
}: DocumentRevisingItemProps) {
  const vd = doc.hist.map((h) => getDayOffset(h[1]));
  const first = Math.max(0, Math.min(...vd));
  const due = getDayOffset(doc.due);

  // 动态派生状态与逾期判定
  const { status, isLate } = getDocStatus(doc);

  const onSegX1 = isLate ? due + 1 : todayOffset + 1;
  const overSegX0 = due + 1;
  const overSegX1 = todayOffset + 1;

  return (
    <button
      type="button"
      className="dr"
      role="option"
      data-i={index}
      style={{ "--i": orderIndex } as React.CSSProperties}
      aria-selected={isSelected}
      onClick={() => onSelect?.(index)}
    >
      <span className="dn">
        <b>{doc.n}</b>
        <small>
          {doc.task} · {doc.who}
        </small>
      </span>
      <span className="trk" aria-hidden="true">
        {/* 今日指示线 */}
        <i
          className="now"
          style={{ left: getTimelinePercent(todayOffset + 0.5) }}
        />

        {/* 截止线与标签 */}
        <i className="cap" style={{ left: getTimelinePercent(due + 1) }} />
        <i
          className={`duelb${isLate ? " late" : ""}`}
          style={{ left: getTimelinePercent(due + 1) }}
        >
          截止 {doc.due}
        </i>

        {/* 已进行进度条 */}
        <TimelineBar className="b on" fromOffset={first} toOffset={onSegX1} />

        {/* 逾期进度条 */}
        {isLate && (
          <TimelineBar
            className="b over"
            fromOffset={overSegX0}
            toOffset={overSegX1}
          />
        )}
      </span>
      <span className="dv">{doc.v}</span>
      <span className={`ds${isLate ? " late" : " draft"}`}>{status}</span>
    </button>
  );
}
