import type { DocumentItem } from "../../../../types/documents";

interface DocumentDetailHeroProps {
  doc: DocumentItem;
  status: string;
  isLate: boolean;
  lateDays: number;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function DocumentDetailHero({
  doc,
  status,
  isLate,
  lateDays,
}: DocumentDetailHeroProps) {
  return (
    <div className={`dhero${isLate ? " late" : ""}`} id="doc-hero">
      <div className="hk">
        <h2 id="doc-title">{doc.n}</h2>
        <span className="chip">风险</span>
      </div>
      <div className="row">
        <b id="dh-n">{isLate ? pad2(lateDays) : doc.v}</b>
        <span id="dh-sub">
          {isLate ? (
            <>
              天 逾期
              <br />
              截止 {doc.due}
            </>
          ) : doc.final ? (
            <>
              定稿
              <br />
              {doc.up}
            </>
          ) : (
            <>
              {status}
              <br />
              截止 {doc.due}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

