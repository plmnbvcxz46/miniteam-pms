import type { DocumentItem } from "../../../types/documents";
import { getDocStatus } from "../utils";

interface DocumentDetailProps {
  doc: DocumentItem | null;
  onTaskClick?: (taskId: string) => void;
  onUploadVersion?: () => void;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default function DocumentDetail({
  doc,
  onTaskClick,
  onUploadVersion,
}: DocumentDetailProps) {
  if (!doc) {
    return (
      <section className="pnl dside">
        <div style={{ padding: "20px", color: "var(--mute)" }}>
          请选择一个文档查看详情
        </div>
      </section>
    );
  }

  const { status, isLate, lateDays } = getDocStatus(doc);

  return (
    <section className="pnl dside">
      {/* 顶部 Hero 状态卡片 */}
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

      {/* 属性元数据清单 */}
      <dl className="facts" id="doc-facts">
        <dt>关联任务</dt>
        <dd>
          {doc.tid ? (
            <span
              className="lnk"
              data-t={doc.tid}
              onClick={() => onTaskClick?.(doc.tid!)}
            >
              {doc.task}
            </span>
          ) : (
            doc.task || "—"
          )}
        </dd>
        <dt>负责人</dt>
        <dd>{doc.who}</dd>
        <dt>截止</dt>
        <dd>{doc.due}</dd>
        <dt>状态</dt>
        <dd className={isLate ? "late" : ""}>{status}</dd>
      </dl>

      {/* 版本记录 */}
      <div className="hhead">
        <b>版本记录</b>
        <span
          className="u mono"
          style={{ fontSize: "10px", color: "var(--mute)" }}
          id="doc-hn"
        >
          共 {doc.hist.length} 版
        </span>
      </div>

      <div className="hist scroll-y" id="doc-hist">
        {doc.hist.map((h, idx) => (
          <div key={idx} className="hv">
            <b>{h[0]}</b>
            <span>{h[3]}</span>
            <small>
              {h[1]} · {h[2]}
            </small>
          </div>
        ))}
      </div>

      {/* 底部上传按钮 */}
      <div className="up">
        <button
          className="btn primary"
          type="button"
          data-form="doc"
          onClick={onUploadVersion}
        >
          上传新版本 <span aria-hidden="true">↑</span>
        </button>
      </div>
    </section>
  );
}
