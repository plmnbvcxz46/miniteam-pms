import { createContext, useContext } from "react";
import type { Activity, TaskStatus } from "../../types/global";
import type { TaskDetail, TaskFormValues } from "../../types/task";

/** 看板、任务详情、时间线等共用的任务数据，来自接口 */
export interface TaskStore {
  taskMap: Record<number, TaskDetail>;
  activityMap: Record<number, Activity[]>;
  /** 任务表每重新取一次加一；时间线、总览、报表据此重新取各自的接口 */
  version: number;
  /** 重新取一遍任务表（别的模块改了任务详情里带着的数据，例如文档，之后调用） */
  reload: () => Promise<void>;
  /**
   * 把任务移到某列的第 index 位，对应 PUT /tasks/{taskId}/position。
   * 先在页面上移动，接口失败再退回。没有移动时返回原因（没权限、文档还没定稿、接口报错），移动成功返回 null
   */
  moveTask: (taskId: number, status: TaskStatus, index: number) => Promise<string | null>;
  /** 打开中的任务表单：taskId 为空是新建，否则是编辑 */
  taskForm: { taskId: number | null } | null;
  openTaskForm: (taskId?: number) => void;
  closeTaskForm: () => void;
  /**
   * 保存表单，对应 POST /projects/{projectId}/tasks 和 PUT /tasks/{taskId}（前置任务变了再 PUT /tasks/{taskId}/predecessors）。
   * 失败时抛 ApiError，message 是接口返回的原因，成功后关闭表单
   */
  saveTaskForm: (values: TaskFormValues) => Promise<void>;
  /** 删除任务，对应 DELETE /tasks/{taskId}。没有权限或失败时返回原因，删除成功返回 null */
  deleteTask: (taskId: number) => Promise<string | null>;
  /** 刚新建的任务，看板上短暂高亮 */
  freshTaskId: number | null;
}

export const TaskStoreContext = createContext<TaskStore | null>(null);

export function useTaskStore(): TaskStore {
  const store = useContext(TaskStoreContext);
  if (!store) throw new Error("useTaskStore 必须在 TaskProvider 内使用");
  return store;
}
