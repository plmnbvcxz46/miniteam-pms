import type { Activity, TaskStatus } from "../shared/types/global";
import type { Workload } from "../shared/types/reports";
import type {
  DependencyTask,
  TaskCard,
  TaskCreate,
  TaskDetail,
  TaskUpdate,
} from "../shared/types/task";
import { http } from "./http";

export const taskApi = {
  /** detail=true：每项带 TaskDetail 的全部字段，一次取完整任务表 */
  list: (projectId: number) =>
    http.get<TaskDetail[]>(`/projects/${projectId}/tasks`, { detail: true }),
  get: (taskId: number) => http.get<TaskDetail>(`/tasks/${taskId}`),
  create: (projectId: number, body: TaskCreate) =>
    http.post<TaskDetail>(`/projects/${projectId}/tasks`, body),
  update: (taskId: number, body: TaskUpdate) =>
    http.put<TaskDetail>(`/tasks/${taskId}`, body),
  remove: (taskId: number) => http.delete<void>(`/tasks/${taskId}`),
  status: (taskId: number, status: TaskStatus) =>
    http.put<TaskCard>(`/tasks/${taskId}/status`, { status }),
  position: (taskId: number, status: TaskStatus, index: number) =>
    http.put<TaskCard>(`/tasks/${taskId}/position`, { status, index }),
  setPredecessors: (taskId: number, preTaskIds: number[]) =>
    http.put<DependencyTask[]>(`/tasks/${taskId}/predecessors`, { preTaskIds }),
  activities: (taskId: number) => http.get<Activity[]>(`/tasks/${taskId}/activities`),
};

export const workloadApi = {
  get: (projectId: number) => http.get<Workload>(`/projects/${projectId}/workload`),
};
