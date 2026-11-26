import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/patterns/ToastHost";
import { taskStatusOrder } from "../../../shared/constants/task";
import type { TaskDetail } from "../../../shared/types/task";
import { useAccess } from "../../../stores/access/useAccess";
import { useMe } from "../../../stores/auth/useAuth";
import { useIssue } from "../../../stores/issue/useIssue";
import { useTaskStore } from "../../../stores/task/taskStore";
import {
  canMoveStatus,
  getBlockedTasks,
  getColumnTasks,
  toFullIndex,
} from "../../../stores/task/utils";
import type { BoardFilter } from "../components/BoardHeader";
import { useCardDrag, type DropTarget } from "./useCardDrag";

export function useBoardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: currentUser } = useMe();
  const { canEditTask, canViewTask, canMoveTask } = useAccess();
  const { today, isPast } = useIssue();
  const { taskMap, activityMap, moveTask, openTaskForm, freshTaskId } =
    useTaskStore();
  const [filter, setFilter] = useState<BoardFilter>("all");

  const handleDrop = async (taskId: number, target: DropTarget) => {
    const index = toFullIndex(taskMap, taskId, target, canViewTask);
    const blocked = await moveTask(taskId, target.status, index);
    if (blocked) toast(blocked, { tone: "danger" });
  };

  const { drag, handlePress, wasDragged } = useCardDrag(
    handleDrop,
    (taskId, status) => canMoveStatus(taskMap[taskId].status, status),
  );

  const allTasks = Object.values(taskMap).filter(canViewTask);
  const blockedCount = allTasks.filter((t) => t.status === "BLOCKED").length;
  const criticalCount = allTasks.filter(
    (t) => t.critical && t.status !== "DONE",
  ).length;
  const kicker = `共 ${allTasks.length} 项 · ${
    blockedCount > 0 ? `${blockedCount} 项阻塞` : "没有阻塞"
  } · ${criticalCount} 项在关键路径`;

  const isDimmed = (task: TaskDetail) => {
    if (filter === "mine") return task.assignee?.id !== currentUser.id;
    if (filter === "crit") return !task.critical;
    return false;
  };

  const handleOpenTask = (taskId: number) => {
    if (!wasDragged()) navigate(`/board/task?id=${taskId}`);
  };

  const columns = taskStatusOrder.map((status) => ({
    status,
    tasks: getColumnTasks(taskMap, status).filter(canViewTask),
  }));

  return {
    filter,
    setFilter,
    kicker,
    today,
    isPast,
    columns,
    blockedTasks: getBlockedTasks(taskMap).filter(canViewTask),
    taskMap,
    activityMap,
    drag,
    freshTaskId,
    canEditTask,
    canMove: canMoveTask,
    isDimmed,
    handlePress,
    handleOpenTask,
    handleCreateTask: canEditTask ? () => openTaskForm() : undefined,
  };
}
