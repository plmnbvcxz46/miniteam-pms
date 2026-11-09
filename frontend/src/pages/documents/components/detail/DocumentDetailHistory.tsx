import type {
  DocumentItem,
  DocumentVersionItem,
} from "../../../../shared/types/documents";

interface DocumentDetailHistoryProps {
  doc: DocumentItem;
  /** 下载某个版本的文件；不传（例如看过去的期）就不显示下载按钮 */
  onDownloadVersion?: (version: DocumentVersionItem) => void;
}

/**
 * 格式化文件大小为易读字符串（如 1.8 MB、512 KB）
 */
function formatFileSize(size: number): string {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentDetailHistory({
  doc,
  onDownloadVersion,
}: DocumentDetailHistoryProps) {
  return (
    <>
      <div className="hhead">
        <b>版本记录</b>
        <span
          className="u t-hint"
          id="doc-hn"
        >
          共 {doc.hist.length} 版
        </span>
      </div>

      <div className="hist scroll-y" id="doc-hist">
        {doc.hist.map((ver) => {
          const sizeStr = formatFileSize(ver.fileSize);

          return (
            <div key={ver.id} className="hv">
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
                  {onDownloadVersion && (
                    <button
                      type="button"
                      className="hv-download-btn"
                      onClick={() => onDownloadVersion(ver)}
                      title={`下载 ${ver.fileName}`}
                    >
                      下载 ↓
                    </button>
                  )}
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

