import type { TaskDetail } from "../../../../../types/task";
import { formatDocStatus } from "../../utils";
import LinkRow from "./LinkRow";

interface TaskInfoPanelProps {
  task: TaskDetail;
  onOpenDocument: (documentId: number) => void;
  onOpenDiscussion: () => void;
  onCreateDiscussion: () => void;
  onUploadDocument: () => void;
}

export default function TaskInfoPanel({
  task,
  onOpenDocument,
  onOpenDiscussion,
  onCreateDiscussion,
  onUploadDocument,
}: TaskInfoPanelProps) {
  const hasLinks = task.documents.length > 0 || task.discussions.length > 0;

  return (
    <section className="pnl">
      <div className="phd">
        <div>
          <span className="k">// NOTES</span>
          <h2>任务说明</h2>
        </div>
      </div>
      <div className="scroll-y">
        <p className="tk-desc">{task.description ?? "还没有说明。"}</p>
        <div className="phd" style={{ marginTop: "16px" }}>
          <div>
            <span className="k">// LINKS</span>
            <h2>文档与讨论</h2>
          </div>
        </div>
        <div id="tk-links">
          {task.documents.map((doc) => (
            <LinkRow
              key={`doc-${doc.id}`}
              tag="文档"
              title={doc.name}
              sub={doc.currentVersion ?? ""}
              state={formatDocStatus(doc)}
              late={doc.overdueDays > 0}
              onClick={() => onOpenDocument(doc.id)}
            />
          ))}
          {task.discussions.map((discussion) => (
            <LinkRow
              key={`discussion-${discussion.id}`}
              tag="讨论"
              title={discussion.title}
              sub={`${discussion.commentCount} 条`}
              onClick={onOpenDiscussion}
            />
          ))}
          {!hasLinks && <div className="dep-none">还没有关联的文档或讨论</div>}
          <div className="tk-adds">
            <button
              className="addcard"
              type="button"
              onClick={onUploadDocument}
            >
              上传文件
            </button>
            <button
              className="addcard"
              type="button"
              onClick={onCreateDiscussion}
            >
              发起讨论
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
