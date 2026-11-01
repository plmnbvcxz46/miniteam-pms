import { useRef, useState, type ReactNode } from "react";
import { currentUser, taskStatusLabel } from "../../data/global";
import {
  taskActivities as initialTaskActivities,
  taskDetails as initialTaskDetails,
  taskTodayDate,
} from "../../data/task";
import type { Activity, TaskStatus } from "../../types/global";
import type { TaskDetail, TaskFormValues } from "../../types/task";
import { TaskStoreContext, type TaskStore } from "./taskStore";
import { createTask, moveTaskTo, updateTask } from "./utils";

/** 新建任务在看板上高亮的时长 */
const FRESH_MS = 2400;

export default function TaskProvider({ children }: { children: ReactNode }) {
  const [taskMap, setTaskMap] =
    useState<Record<number, TaskDetail>>(initialTaskDetails);
  const [activityMap, setActivityMap] = useState<Record<number, Activity[]>>(
    initialTaskActivities,
  );
  const [taskForm, setTaskForm] = useState<TaskStore["taskForm"]>(null);
  const [freshTaskId, setFreshTaskId] = useState<number | null>(null);
  const freshTimer = useRef<number | undefined>(undefined);

  // 追加一条操作记录
  const addLog = (taskId: number, action: string, text: string) => {
    const newActivity: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "TASK",
      targetId: taskId,
      action,
      detail: `${currentUser.realName} ${text}`,
      createdAt: `${taskTodayDate} 刚刚`,
    };
    setActivityMap((prev) => ({
      ...prev,
      [taskId]: [newActivity, ...(prev[taskId] ?? [])],
    }));
  };

  // 移动任务；换了列才追加操作记录
  const moveTask = (taskId: number, status: TaskStatus, index: number) => {
    const statusChanged = taskMap[taskId].status !== status;
    setTaskMap((prev) =>
      moveTaskTo(prev, taskId, status, index, taskTodayDate),
    );
    if (statusChanged) {
      addLog(taskId, "STATUS", `把任务移到${taskStatusLabel[status]}`);
    }
  };

  const saveTaskForm = (values: TaskFormValues) => {
    const editingId = taskForm?.taskId ?? null;
    setTaskForm(null);

    if (editingId !== null) {
      setTaskMap((prev) => updateTask(prev, editingId, values, taskTodayDate));
      addLog(editingId, "UPDATE", "修改了任务");
      return;
    }

    const newId = Math.max(...Object.keys(taskMap).map(Number)) + 1;
    setTaskMap((prev) => createTask(prev, newId, values, taskTodayDate));
    addLog(newId, "CREATE", "创建任务");

    setFreshTaskId(newId);
    window.clearTimeout(freshTimer.current);
    freshTimer.current = window.setTimeout(
      () => setFreshTaskId(null),
      FRESH_MS,
    );
  };

  return (
    <TaskStoreContext.Provider
      value={{
        taskMap,
        activityMap,
        moveTask,
        taskForm,
        openTaskForm: (taskId) => setTaskForm({ taskId: taskId ?? null }),
        closeTaskForm: () => setTaskForm(null),
        saveTaskForm,
        freshTaskId,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}
