import { Button } from "../../../components/ui/Button";
import type {
  DocumentItem,
  DocumentVersionItem,
} from "../../../shared/types/documents";
import { formatFileSize } from "../utils";
import styles from "./DocumentDetailHistory.module.css";

interface DocumentDetailHistoryProps {
  doc: DocumentItem;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
}

export default function DocumentDetailHistory({
  doc,
  onDownloadVersion,
}: DocumentDetailHistoryProps) {
  return (
    <>
      <div className={styles.historyHead}>
        <b className={styles.historyTitle}>版本记录</b>
        <span className={styles.historyCount}>共 {doc.hist.length} 版</span>
      </div>

      <div className={styles.historyList}>
        {doc.hist.map((ver) => {
          const sizeStr = formatFileSize(ver.fileSize);

          return (
            <div key={ver.id} className={styles.versionItem}>
              <b className={styles.versionTag}>{ver.version}</b>
              <div className={styles.versionNote} title={ver.comment}>
                {ver.comment}
              </div>

              {ver.fileName && (
                <div className={styles.versionFileRow}>
                  <div className={styles.versionFileInfo} title={ver.fileName}>
                    <span className={styles.versionFileName}>
                      {ver.fileName}
                    </span>
                    {sizeStr && (
                      <span className={styles.versionFileSize}>
                        ({sizeStr})
                      </span>
                    )}
                  </div>
                  {onDownloadVersion && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onDownloadVersion(ver)}
                      title={`下载 ${ver.fileName}`}
                    >
                      下载 ↓
                    </Button>
                  )}
                </div>
              )}

              <small className={styles.versionMeta}>
                {ver.date} · {ver.operator}
              </small>
            </div>
          );
        })}
      </div>
    </>
  );
}
