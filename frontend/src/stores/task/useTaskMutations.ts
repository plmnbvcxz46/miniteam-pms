import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { taskApi } from "../../services/task";
import type { Activity, TaskStatus } from "../../shared/types/global";
import type { TaskDetail, TaskFormValues } from "../../shared/types/task";
import { getLocalToday } from "../../shared/utils/date";
import type { TaskStore } from "./taskStore";
import { moveTaskTo } from "./utils";

const FRESH_MS = 2400;

export interface LoadedTaskData {
  tasks: Record<number, TaskDetail>;
  activities: Record<number, Activity[]>;
}

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : "操作失败，请稍后再试";
}

async function persistTaskForm(
  projectId: number,
  editingId: number | null,
  taskMap: Record<number, TaskDetail>,
  values: TaskFormValues,
): Promise<number | null> {
  if (editingId !== null) {
    const old = taskMap[editingId];
    await taskApi.update(editingId, {
      title: values.title,
      description: values.description,
      assigneeId: values.assigneeId,
      planStart: values.planStart,
      planDays: values.planDays,
    });
    const before = old.predecessors.map((dep) => dep.task.id).sort();
    const after = [...values.predecessorIds].sort();
    if (before.join() !== after.join()) {
      await taskApi.setPredecessors(editingId, values.predecessorIds);
    }
    return null;
  }
  const created = await taskApi.create(projectId, {
    title: values.title,
    description: values.description,
    assigneeId: values.assigneeId,
    planStart: values.planStart,
    planDays: values.planDays,
    predecessorIds: values.predecessorIds,
  });
  return created.id;
}

interface UseTaskMutationsParams {
  projectId: number | null;
  isPast: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canMoveTask: (task: TaskDetail) => boolean;
  loaded: LoadedTaskData | null;
  setLoadedState: Dispatch<SetStateAction<LoadedTaskData | null>>;
  taskMap: Record<number, TaskDetail>;
  reload: () => Promise<void>;
  taskForm: TaskStore["taskForm"];
  setTaskForm: Dispatch<SetStateAction<TaskStore["taskForm"]>>;
}

export function useTaskMutations({
  projectId,
  isPast,
  canEditTask,
  canDeleteTask,
  canMoveTask,
  loaded,
  setLoadedState,
  taskMap,
  reload,
  taskForm,
  setTaskForm,
}: UseTaskMutationsParams) {
  const [freshTaskId, setFreshTaskId] = useState<number | null>(null);
  const freshTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(freshTimer.current), []);

  const moveTask = async (taskId: number, status: TaskStatus, index: number) => {
    if (isPast) return "过去的期只能查看";
    const task = taskMap[taskId];
    if (!task || !canMoveTask(task)) return "没有权限修改这个任务的状态";
    const before = loaded;
    setLoadedState(
      (prev) =>
        prev && {
          ...prev,
          tasks: moveTaskTo(prev.tasks, taskId, status, index, getLocalToday()),
        },
    );
    try {
      await taskApi.position(taskId, status, index);
      await reload();
      return null;
    } catch (e) {
      setLoadedState(before);
      return messageOf(e);
    }
  };

  const saveTaskForm = async (values: TaskFormValues) => {
    if (isPast) throw new Error("过去的期只能查看");
    if (!canEditTask || projectId === null) throw new Error("没有编辑任务的权限");
    const editingId = taskForm?.taskId ?? null;
    try {
      const createdId = await persistTaskForm(projectId, editingId, taskMap, values);
      if (createdId !== null) {
        setFreshTaskId(createdId);
        window.clearTimeout(freshTimer.current);
        freshTimer.current = window.setTimeout(() => setFreshTaskId(null), FRESH_MS);
      }
    } finally {
      await reload().catch(() => undefined);
    }
    setTaskForm(null);
  };

  const deleteTask = async (taskId: number) => {
    if (isPast) return "过去的期只能查看";
    if (!canDeleteTask) return "只有项目经理和系统管理员能删除任务";
    try {
      await taskApi.remove(taskId);
      await reload();
      return null;
    } catch (e) {
      return messageOf(e);
    }
  };

  return { moveTask, saveTaskForm, deleteTask, freshTaskId };
}
