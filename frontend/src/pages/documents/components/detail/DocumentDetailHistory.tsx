import type {
  DocumentItem,
  DocVersionRecord,
  DocumentVersionItem,
} from "../../../../types/documents";

interface DocumentDetailHistoryProps {
  doc: DocumentItem;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
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
function normalizeVersion(
  record: DocVersionRecord,
  docName: string
): DocumentVersionItem {
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

export default function DocumentDetailHistory({
  doc,
  onDownloadVersion,
}: DocumentDetailHistoryProps) {
  const handleDownload = (ver: DocumentVersionItem) => {
    if (onDownloadVersion) {
      onDownloadVersion(ver);
      return;
    }
    // 默认提供友好的下载提示交互
    alert(`准备下载版本【${ver.version}】附件: ${ver.fileName || "文件"}`);
  };

  return (
    <>
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
                    {sizeStr && (
                      <span className="hv-file-size">({sizeStr})</span>
                    )}
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
    </>
  );
}

