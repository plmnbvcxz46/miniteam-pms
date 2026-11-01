import { createContext, useContext } from "react";
import type { Activity, TaskStatus } from "../../types/global";
import type { TaskDetail } from "../../types/task";

/** 看板和任务详情共用的任务状态，接通接口后改为请求数据 */
export interface TaskStore {
  taskMap: Record<number, TaskDetail>;
  activityMap: Record<number, Activity[]>;
  /** 把任务移到某列的第 index 位，对应 PUT /tasks/{taskId}/position */
  moveTask: (taskId: number, status: TaskStatus, index: number) => void;
}

export const TaskStoreContext = createContext<TaskStore | null>(null);

export function useTaskStore(): TaskStore {
  const store = useContext(TaskStoreContext);
  if (!store) throw new Error("useTaskStore 必须在 TaskProvider 内使用");
  return store;
}
