import type { TaskStatus } from "../types/global";

/** 任务状态的先后顺序，看板列和状态按钮都按它排 */
export const taskStatusOrder: TaskStatus[] = ["TODO", "DOING", "BLOCKED", "DONE"];

/** 任务状态中文名 */
export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: "待开始",
  DOING: "进行中",
  BLOCKED: "阻塞",
  DONE: "已完成",
};

/** 任务状态对应的 .key 色块 class */
export const taskStatusKey: Record<TaskStatus, string> = {
  TODO: "",
  DOING: "on",
  BLOCKED: "stuck",
  DONE: "done",
};
