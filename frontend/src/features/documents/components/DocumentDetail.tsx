import { EmptyState } from "../../../components/patterns/EmptyState";
import { Panel } from "../../../components/patterns/Panel";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import type {
  BoundDocument,
  DocumentVersionItem,
} from "../../../shared/types/documents";
import { getDocStatus } from "../utils";
import styles from "./DocumentDetail.module.css";
import DocumentDetailFacts from "./DocumentDetailFacts";
import DocumentDetailHero from "./DocumentDetailHero";
import DocumentDetailHistory from "./DocumentDetailHistory";

interface DocumentDetailProps {
  doc: BoundDocument | null;
  today: string;
  actionError?: string;
  onTaskClick?: (taskId: number) => void;
  onUploadVersion?: () => void;
  onFinalize?: () => void;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
}

export default function DocumentDetail({
  doc,
  today,
  actionError,
  onTaskClick,
  onUploadVersion,
  onFinalize,
  onDownloadVersion,
}: DocumentDetailProps) {
  if (!doc) {
    return (
      <Panel variant="flat" className={styles.emptyPanel}>
        <EmptyState variant="compact" description="请选择一个文档查看详情" />
      </Panel>
    );
  }

  const { status, isLate, lateDays } = getDocStatus(doc, today);

  return (
    <aside className={styles.column} aria-label="文档详情">
      <DocumentDetailHero
        doc={doc}
        status={status}
        isLate={isLate}
        lateDays={lateDays}
      />

      <div className={styles.detailCard}>
        <DocumentDetailFacts
          doc={doc}
          status={status}
          isLate={isLate}
          onTaskClick={onTaskClick}
        />

        <DocumentDetailHistory
          doc={doc}
          onDownloadVersion={onDownloadVersion}
        />

        {((onUploadVersion && !doc.final) || actionError) && (
          <div className={styles.actions}>
            {actionError && (
              <Alert variant="inline" tone="danger">
                {actionError}
              </Alert>
            )}
            {onUploadVersion && !doc.final && (
              <>
                <Button
                  variant="primary"
                  className={styles.actionBtn}
                  onClick={onUploadVersion}
                >
                  <span>上传新版本</span>
                  <span aria-hidden="true">↑</span>
                </Button>
                {onFinalize && (
                  <Button
                    variant="default"
                    className={styles.actionBtn}
                    onClick={onFinalize}
                  >
                    <span>定稿</span>
                    <span aria-hidden="true">✓</span>
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
