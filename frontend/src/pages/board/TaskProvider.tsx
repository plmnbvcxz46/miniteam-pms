import { useMemo, useRef, useState, type ReactNode } from "react";
import { useAccess } from "../../access/useAccess";
import { useMe } from "../../auth/useAuth";
import { useConfigs } from "../../config/useConfigs";
import { issueTaskStates } from "../../data/issueSnapshots";
import { useIssue } from "../../issue/useIssue";
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
import {
  createTask,
  getTaskAtIssue,
  moveTaskTo,
  removeTask,
  updateTask,
} from "./utils";

/** 新建任务在看板上高亮的时长 */
const FRESH_MS = 2400;

export default function TaskProvider({ children }: { children: ReactNode }) {
  const { docs } = useDocumentStore();
  const { user: currentUser } = useMe();
  const { canEditTask, canDeleteTask, canMoveTask } = useAccess();
  const { isPast, viewing, today } = useIssue();
  const [baseTaskMap, setTaskMap] =
    useState<Record<number, TaskDetail>>(initialTaskDetails);
  const { values: configValues } = useConfigs();
  // 任务关联的文档由文档数据按 taskId 得出，不在任务里另存一份；
  // 未完成任务的优先级得分由评分算法和系统参数里的权重得出，改了任务或权重就跟着变
  const taskMap = useMemo(() => {
    // 看过去的期时，任务取当时的状态，那时还没创建的任务不出现
    const states = isPast ? (issueTaskStates[viewing.issueNo] ?? {}) : null;
    const visible = states
      ? Object.values(baseTaskMap).flatMap((task) =>
          states[task.id] ? [getTaskAtIssue(task, states, today)] : [],
        )
      : Object.values(baseTaskMap);
    const withDocs = visible.map((task) => ({
      ...task,
      documents: docs
        .filter((doc) => doc.taskId === task.id)
        .map((doc) => toDocumentBrief(doc, task, today)),
    }));
    const priorities = calculatePriorities(
      withDocs,
      today,
      readPriorityConfig(configValues),
    );
    return Object.fromEntries(
      withDocs.map((task) => [
        task.id,
        priorities[task.id] ? { ...task, priority: priorities[task.id] } : task,
      ]),
    ) as Record<number, TaskDetail>;
  }, [baseTaskMap, docs, configValues, isPast, viewing.issueNo, today]);
  const [allActivityMap, setActivityMap] = useState<Record<number, Activity[]>>(
    initialTaskActivities,
  );
  // 看过去的期时，操作记录只留那一天以前的
  const activityMap = useMemo(() => {
    if (!isPast) return allActivityMap;
    return Object.fromEntries(
      Object.entries(allActivityMap).map(([id, list]) => [
        id,
        list.filter((log) => log.createdAt.slice(0, 10) <= today),
      ]),
    );
  }, [allActivityMap, isPast, today]);
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
    // 页面上没权限的人看不到入口，这里再挡一道，防止别处误调用
    if (isPast) return "过去的期只能查看";
    if (!canMoveTask(taskMap[taskId])) return "没有权限修改这个任务的状态";
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
    // 新建和修改任务都需要“编辑任务”权限
    if (!canEditTask) return;

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

  const deleteTask = (taskId: number) => {
    // 页面上没权限的人看不到入口，这里再挡一道，防止别处误调用
    if (isPast) return "过去的期只能查看";
    if (!canDeleteTask) return "只有项目经理和系统管理员能删除任务";
    setTaskMap((prev) => removeTask(prev, taskId));
    setActivityMap((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([id]) => Number(id) !== taskId),
      ),
    );
    return null;
  };

  return (
    <TaskStoreContext.Provider
      value={{
        taskMap,
        activityMap,
        moveTask,
        taskForm,
        openTaskForm: (taskId) => {
          if (canEditTask) setTaskForm({ taskId: taskId ?? null });
        },
        closeTaskForm: () => setTaskForm(null),
        saveTaskForm,
        deleteTask,
        freshTaskId,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}
