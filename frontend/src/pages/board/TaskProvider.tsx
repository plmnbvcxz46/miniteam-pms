import { useState, type ReactNode } from "react";
import { currentUser, taskStatusLabel } from "../../data/global";
import {
  taskActivities as initialTaskActivities,
  taskDetails as initialTaskDetails,
  taskTodayDate,
} from "../../data/task";
import type { Activity, TaskStatus } from "../../types/global";
import type { TaskDetail } from "../../types/task";
import { TaskStoreContext } from "./taskStore";
import { moveTaskTo } from "./utils";

export default function TaskProvider({ children }: { children: ReactNode }) {
  const [taskMap, setTaskMap] =
    useState<Record<number, TaskDetail>>(initialTaskDetails);
  const [activityMap, setActivityMap] = useState<Record<number, Activity[]>>(
    initialTaskActivities,
  );

  // 移动任务；换了列才追加操作记录
  const moveTask = (taskId: number, status: TaskStatus, index: number) => {
    const statusChanged = taskMap[taskId].status !== status;
    setTaskMap((prev) =>
      moveTaskTo(prev, taskId, status, index, taskTodayDate),
    );
    if (!statusChanged) return;

    const newActivity: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "TASK",
      targetId: taskId,
      action: "STATUS",
      detail: `${currentUser.realName} 把任务移到${taskStatusLabel[status]}`,
      createdAt: `${taskTodayDate} 刚刚`,
    };
    setActivityMap((prev) => ({
      ...prev,
      [taskId]: [newActivity, ...prev[taskId]],
    }));
  };

  return (
    <TaskStoreContext.Provider value={{ taskMap, activityMap, moveTask }}>
      {children}
    </TaskStoreContext.Provider>
  );
}
