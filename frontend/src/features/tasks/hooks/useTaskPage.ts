import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../components/patterns/ToastHost";
import type { TaskStatus } from "../../../shared/types/global";
import { useAccess } from "../../../state/access/useAccess";
import { useIssue } from "../../../state/issue/useIssue";
import { useTaskStore } from "../../../state/task/taskStore";

export function useTaskPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { canEditTask, canDeleteTask, canViewTask, canMoveTask } = useAccess();
  const { today } = useIssue();
  const { taskMap, activityMap, moveTask, openTaskForm, deleteTask } =
    useTaskStore();

  const [openedDirectly] = useState(location.key === "default");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const task = taskMap[Number(searchParams.get("id"))];

  const handleBack = () => {
    if (openedDirectly) navigate("/board");
    else navigate(-1);
  };

  const handleOpenTask = (taskId: number) => {
    navigate(`/board/task?id=${taskId}`, { replace: true });
  };

  const handleChangeStatus = async (status: TaskStatus) => {
    if (!task || status === task.status) return;
    const blocked = await moveTask(task.id, status, 0);
    if (blocked) toast(blocked, { tone: "danger" });
  };

  const handleConfirmDelete = async () => {
    if (!task || deleting) return;
    setDeleting(true);
    const blocked = await deleteTask(task.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (blocked) toast(blocked, { tone: "danger" });
  };

  return {
    task,
    today,
    activities: task ? activityMap[task.id] ?? [] : [],
    hasAccess: task ? canViewTask(task) : false,
    canMove: task ? canMoveTask(task) : false,
    canEdit: canEditTask,
    canDelete: canDeleteTask,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleting,
    handleBack,
    handleOpenTask,
    handleChangeStatus,
    handleConfirmDelete,
    handleOpenEdit: () => {
      if (task) openTaskForm(task.id);
    },
    handleOpenDocument: (documentId: number) =>
      navigate(`/documents?id=${documentId}`),
    handleOpenDiscussion: (discussionId: number) =>
      navigate(`/collab?discussionId=${discussionId}`),
    handleUploadDocument: () => {
      if (task) navigate("/documents", { state: { uploadTaskId: task.id } });
    },
    handleCreateDiscussion: () => {
      if (task) navigate("/collab", { state: { newDiscussionTaskId: task.id } });
    },
  };
}
