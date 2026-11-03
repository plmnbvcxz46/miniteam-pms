import { useMemo, useRef, useState, type ReactNode } from "react";
import { useMe } from "../../auth/useAuth";
import { useConfigs } from "../../config/useConfigs";
import { taskStatusLabel } from "../../data/global";
import {
  taskActivities as initialTaskActivities,
  taskDetails as initialTaskDetails,
  taskTodayDate,
} from "../../data/task";
import type { Activity, TaskStatus } from "../../types/global";
import type { TaskDetail, TaskFormValues } from "../../types/task";
import { useDocumentStore } from "../documents/documentStore";
import { toDocumentBrief } from "../documents/utils";
import { calculatePriorities, readPriorityConfig } from "./priority";
import { TaskStoreContext, type TaskStore } from "./taskStore";
import { createTask, moveTaskTo, updateTask } from "./utils";

/** 新建任务在看板上高亮的时长 */
const FRESH_MS = 2400;

export default function TaskProvider({ children }: { children: ReactNode }) {
  const { docs } = useDocumentStore();
  const { user: currentUser } = useMe();
  const [baseTaskMap, setTaskMap] =
    useState<Record<number, TaskDetail>>(initialTaskDetails);
  const { values: configValues } = useConfigs();
  // 任务关联的文档由文档数据按 taskId 得出，不在任务里另存一份；
  // 未完成任务的优先级得分由评分算法和系统参数里的权重得出，改了任务或权重就跟着变
  const taskMap = useMemo(() => {
    const withDocs = Object.values(baseTaskMap).map((task) => ({
      ...task,
      documents: docs
        .filter((doc) => doc.taskId === task.id)
        .map((doc) => toDocumentBrief(doc, task, taskTodayDate)),
    }));
    const priorities = calculatePriorities(
      withDocs,
      taskTodayDate,
      readPriorityConfig(configValues),
    );
    return Object.fromEntries(
      withDocs.map((task) => [
        task.id,
        priorities[task.id] ? { ...task, priority: priorities[task.id] } : task,
      ]),
    ) as Record<number, TaskDetail>;
  }, [baseTaskMap, docs, configValues]);
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

  // 移动任务；换了列才追加操作记录。
  // 关联的文档没定稿时不能完成任务，这时不移动，返回原因
  const moveTask = (taskId: number, status: TaskStatus, index: number) => {
    if (status === "DONE") {
      const pending = docs.find((doc) => doc.taskId === taskId && !doc.final);
      if (pending) return `文档《${pending.n}》还没定稿，定稿后才能完成任务`;
    }
    const statusChanged = taskMap[taskId].status !== status;
    setTaskMap((prev) =>
      moveTaskTo(prev, taskId, status, index, taskTodayDate),
    );
    if (statusChanged) {
      addLog(taskId, "STATUS", `把任务移到${taskStatusLabel[status]}`);
    }
    return null;
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
    setTaskMap((prev) => createTask(prev, newId, values, taskTodayDate, currentUser));
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
