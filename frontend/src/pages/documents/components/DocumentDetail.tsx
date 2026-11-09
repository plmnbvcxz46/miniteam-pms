import type {
  BoundDocument,
  DocumentVersionItem,
} from "../../../shared/types/documents";
import { getDocStatus } from "../utils";
import DocumentDetailHero from "./DocumentDetailHero";
import DocumentDetailFacts from "./DocumentDetailFacts";
import DocumentDetailHistory from "./DocumentDetailHistory";

interface DocumentDetailProps {
  doc: BoundDocument | null;
  /** 今日基准日期（从假数据快照注入） */
  currentDate?: string;
  onTaskClick?: (taskId: number) => void;
  onUploadVersion?: () => void;
  onFinalize?: () => void;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
}

export default function DocumentDetail({
  doc,
  currentDate,
  onTaskClick,
  onUploadVersion,
  onFinalize,
  onDownloadVersion,
}: DocumentDetailProps) {
  if (!doc) {
    return (
      <section className="pnl dside">
        <div className="t-meta" style={{ padding: "20px" }}>
          请选择一个文档查看详情
        </div>
      </section>
    );
  }

  const { status, isLate, lateDays } = getDocStatus(doc, currentDate);

  return (
    <section className="pnl dside">
      {/* 顶部 Hero 状态卡片 */}
      <DocumentDetailHero
        doc={doc}
        status={status}
        isLate={isLate}
        lateDays={lateDays}
      />

      {/* 属性元数据清单 */}
      <DocumentDetailFacts
        doc={doc}
        status={status}
        isLate={isLate}
        onTaskClick={onTaskClick}
      />

      {/* 版本记录 */}
      <DocumentDetailHistory
        doc={doc}
        onDownloadVersion={onDownloadVersion}
      />

      {/* 底部上传按钮 */}
      {/* 定稿后不能再传新版本，也不能再定稿 */}
      {onUploadVersion && !doc.final && (
        <div className="up">
          <button
            className="btn primary"
            type="button"
            data-form="doc"
            onClick={onUploadVersion}
          >
            上传新版本 <span aria-hidden="true">↑</span>
          </button>
          {onFinalize && (
            <button className="btn" type="button" onClick={onFinalize}>
              定稿 <span aria-hidden="true">✓</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}

