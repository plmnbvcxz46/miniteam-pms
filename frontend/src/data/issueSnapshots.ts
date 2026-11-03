import type { TaskStatus } from "../types/global";

/** 过去某一期里，每个任务当时的状态和进度 */
export interface IssueTaskState {
  status: TaskStatus;
  progress: number;
}

/**
 * 过去各期的任务快照，按期号、任务 id；第 32 期（今天）用任务本身的数据。
 * 没出现在某期里的任务，说明那一期还没创建。接口接通后对应 GET /projects/{projectId}/issues/{issueDate}
 */
export const issueTaskStates: Record<number, Record<number, IssueTaskState>> = {
  31: {
    128: { status: "DONE", progress: 100 },
    129: { status: "DONE", progress: 100 },
    131: { status: "DONE", progress: 100 },
    135: { status: "DOING", progress: 25 },
    137: { status: "DOING", progress: 50 },
    139: { status: "DOING", progress: 50 },
    142: { status: "DOING", progress: 60 },
    144: { status: "TODO", progress: 0 },
    146: { status: "TODO", progress: 0 },
    148: { status: "TODO", progress: 0 },
    150: { status: "TODO", progress: 0 },
  },
  30: {
    128: { status: "DONE", progress: 100 },
    129: { status: "DONE", progress: 100 },
    131: { status: "DONE", progress: 100 },
    135: { status: "TODO", progress: 0 },
    137: { status: "DOING", progress: 15 },
    139: { status: "DOING", progress: 35 },
    142: { status: "DOING", progress: 40 },
    144: { status: "TODO", progress: 0 },
    146: { status: "TODO", progress: 0 },
    148: { status: "TODO", progress: 0 },
  },
  29: {
    128: { status: "DONE", progress: 100 },
    129: { status: "DONE", progress: 100 },
    131: { status: "DONE", progress: 100 },
    135: { status: "TODO", progress: 0 },
    137: { status: "TODO", progress: 0 },
    139: { status: "DOING", progress: 15 },
    142: { status: "DOING", progress: 15 },
    144: { status: "TODO", progress: 0 },
    146: { status: "TODO", progress: 0 },
  },
  28: {
    128: { status: "DONE", progress: 100 },
    129: { status: "DONE", progress: 100 },
    131: { status: "DONE", progress: 100 },
    139: { status: "TODO", progress: 0 },
    142: { status: "TODO", progress: 0 },
  },
  27: {
    128: { status: "DOING", progress: 55 },
    129: { status: "DONE", progress: 100 },
    131: { status: "DONE", progress: 100 },
    139: { status: "TODO", progress: 0 },
  },
  26: {
    128: { status: "DOING", progress: 15 },
    129: { status: "DONE", progress: 100 },
    131: { status: "TODO", progress: 0 },
  },
  25: {
    128: { status: "TODO", progress: 0 },
    129: { status: "DOING", progress: 75 },
    131: { status: "TODO", progress: 0 },
  },
  24: {
    129: { status: "DOING", progress: 50 },
  },
  23: {
    129: { status: "DOING", progress: 25 },
  },
};
