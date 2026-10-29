import type {
  DocumentItem,
  DocumentVersionItem,
} from "../../../../types/documents";
import { getDocStatus } from "../../utils";
import DocumentDetailHero from "./DocumentDetailHero";
import DocumentDetailFacts from "./DocumentDetailFacts";
import DocumentDetailHistory from "./DocumentDetailHistory";

interface DocumentDetailProps {
  doc: DocumentItem | null;
  onTaskClick?: (taskId: string) => void;
  onUploadVersion?: () => void;
  onDownloadVersion?: (version: DocumentVersionItem) => void;
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

