import type { LegendItemConfig } from "../../../../shared/constants/legends";
import { DOC_REVISING_LEGENDS } from "../../../../shared/constants/legends";

interface DocumentRevisingHeaderProps {
  count: number;
  legends?: LegendItemConfig[];
}

export default function DocumentRevisingHeader({
  count,
  legends = DOC_REVISING_LEGENDS,
}: DocumentRevisingHeaderProps) {
  return (
    <header className="dsec-h">
      <div>
        <span className="k t-kicker">// REVISING</span>
        <h3 className="t-section-title">修订中</h3>
      </div>
      <div className="legend">
        {legends.map((item) => (
          <span key={item.key}>
            <i
              className={item.sample.className}
              style={item.sample.style}
              aria-hidden="true"
            />
            {item.label}
          </span>
        ))}
      </div>
      <span className="count" id="dc-on">
        {count}
      </span>
    </header>
  );
}
