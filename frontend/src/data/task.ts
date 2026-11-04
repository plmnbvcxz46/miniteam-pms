import type { TaskStatus } from "../types/global";

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 任务状态对应的 .key 色块 class */
export const taskStatusKey: Record<TaskStatus, string> = {
  TODO: "",
  DOING: "on",
  BLOCKED: "stuck",
  DONE: "done",
};

