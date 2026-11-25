import { Panel } from "../../../components/patterns/Panel";
import { Button } from "../../../components/ui/Button";
import type { TaskDetail } from "../../../shared/types/task";
import { formatDocStatus } from "../utils";
import LinkRow from "./LinkRow";
import styles from "./TaskInfoPanel.module.css";

interface TaskInfoPanelProps {
  task: TaskDetail;
  onOpenDocument: (documentId: number) => void;
  onOpenDiscussion: (discussionId: number) => void;
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
    <Panel kicker="// NOTES" title="任务说明" scrollable>
      <p className={styles.desc}>{task.description ?? "还没有说明。"}</p>

      <div className={styles.linksHeader}>
        <span className={styles.linksKicker}>// LINKS</span>
        <h3 className={styles.linksTitle}>文档与讨论</h3>
      </div>

      <div className={styles.links}>
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
            onClick={() => onOpenDiscussion(discussion.id)}
          />
        ))}
        {!hasLinks && (
          <div className={styles.empty}>还没有关联的文档或讨论</div>
        )}

        <div className={styles.adds}>
          <Button
            variant="dashed"
            size="sm"
            className={styles.addBtn}
            onClick={onUploadDocument}
          >
            + 上传文件
          </Button>
          <Button
            variant="dashed"
            size="sm"
            className={styles.addBtn}
            onClick={onCreateDiscussion}
          >
            + 发起讨论
          </Button>
        </div>
      </div>
    </Panel>
  );
}
