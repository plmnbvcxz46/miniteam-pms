import type { LegendItemConfig } from "../../../../constants/legends";
import { DOC_REVISING_LEGENDS } from "../../../../constants/legends";

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
        <span className="k">// REVISING</span>
        <h3>修订中</h3>
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
