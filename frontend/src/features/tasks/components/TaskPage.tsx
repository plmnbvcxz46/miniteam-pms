import { Navigate } from "react-router-dom";
import { ConfirmDialog } from "../../../components/patterns/ConfirmDialog";
import { useTaskPage } from "../hooks/useTaskPage";
import NoAccess from "./NoAccess";
import SchedulePanel from "./SchedulePanel";
import TaskFigures from "./TaskFigures";
import TaskHeader from "./TaskHeader";
import TaskInfoPanel from "./TaskInfoPanel";
import TaskLogPanel from "./TaskLogPanel";
import styles from "./TaskPage.module.css";

export default function TaskPage() {
  const p = useTaskPage();

  if (!p.task) return <Navigate to="/board" replace />;
  if (!p.hasAccess) return <NoAccess onBack={p.handleBack} />;

  return (
    <section className={styles.page} id="view-task" data-view="task">
      <TaskHeader
        task={p.task}
        onBack={p.handleBack}
        onChangeStatus={p.canMove ? p.handleChangeStatus : undefined}
        onEdit={p.canEdit ? p.handleOpenEdit : undefined}
        onRequestDelete={
          p.canDelete ? () => p.setDeleteDialogOpen(true) : undefined
        }
      />
      <TaskFigures task={p.task} />
      <div className={styles.grid}>
        <SchedulePanel
          task={p.task}
          activities={p.activities}
          today={p.today}
          onOpenTask={p.handleOpenTask}
        />
        <TaskInfoPanel
          task={p.task}
          onOpenDocument={p.handleOpenDocument}
          onOpenDiscussion={p.handleOpenDiscussion}
          onUploadDocument={p.handleUploadDocument}
          onCreateDiscussion={p.handleCreateDiscussion}
        />
        <TaskLogPanel activities={p.activities} today={p.today} />
      </div>

      <ConfirmDialog
        open={p.deleteDialogOpen}
        onOpenChange={p.setDeleteDialogOpen}
        title="删除任务？"
        description={`确认删除“${p.task.title}”吗？删除后任务及其排期、依赖关系将永久移除，无法恢复。`}
        confirmLabel="确认删除"
        loading={p.deleting}
        onConfirm={() => void p.handleConfirmDelete()}
      />
    </section>
  );
}
