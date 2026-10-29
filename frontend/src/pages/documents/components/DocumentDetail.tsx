import type { DocumentItem, DocVersionRecord, DocumentVersionItem } from "../../../types/documents";
import { getDocStatus } from "../utils";

interface DocumentDetailProps {
  doc: DocumentItem | null;
  onTaskClick?: (taskId: string) => void;
  onUploadVersion?: () => void;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 格式化文件大小为易读字符串（如 1.8 MB、512 KB）
 */
function formatFileSize(size?: string | number): string {
  if (!size) return "";
  if (typeof size === "string") return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 将版本记录（元组或对象）统一转换为标准对象
 */
function normalizeVersion(record: DocVersionRecord, docName: string): DocumentVersionItem {
  if (Array.isArray(record)) {
    // [version, date, operator, comment]
    return {
      version: record[0],
      date: record[1],
      operator: record[2],
      comment: record[3],
      fileName: `${docName}_${record[0]}.docx`,
      fileSize: "1.2 MB",
    };
  }
  return record;
}

export default function DocumentDetail({
  doc,
  onTaskClick,
  onUploadVersion,
  onDownloadVersion,
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

  const handleDownload = (ver: DocumentVersionItem) => {
    if (onDownloadVersion) {
      onDownloadVersion(ver);
      return;
    }
    // 默认提供友好的下载提示交互
    alert(`准备下载版本【${ver.version}】附件: ${ver.fileName || "文件"}`);
  };

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
        {doc.hist.map((record, idx) => {
          const ver = normalizeVersion(record, doc.n);
          const sizeStr = formatFileSize(ver.fileSize);

          return (
            <div key={idx} className="hv">
              <b>{ver.version}</b>
              <div className="hv-note">{ver.comment}</div>

              {/* 物理文件附件及下载交互 */}
              {ver.fileName && (
                <div className="hv-file">
                  <div className="hv-file-info" title={ver.fileName}>

                    <span className="hv-file-name">{ver.fileName}</span>
                    {sizeStr && <span className="hv-file-size">({sizeStr})</span>}
                  </div>
                  <button
                    type="button"
                    className="hv-download-btn"
                    onClick={() => handleDownload(ver)}
                    title={`下载 ${ver.fileName}`}
                  >
                    下载 ↓
                  </button>
                </div>
              )}

              <small>
                {ver.date} · {ver.operator}
              </small>
            </div>
          );
        })}
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
