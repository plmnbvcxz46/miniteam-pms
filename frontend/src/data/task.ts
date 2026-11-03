import type { Activity, TaskStatus, UserBrief } from "../types/global";
import type { DependencyTask, DocumentBrief, TaskDetail } from "../types/task";
import { discussions } from "./collab";
import { currentProjectId, projectTodayDate, users } from "./global";

/* =========================================================
 * 一、纯前端常量
 * ========================================================= */

/** 今日日期（与顶栏、协作模块假数据同一天），用于算逾期和已用工作日 */
export const taskTodayDate = projectTodayDate;

/** 地址栏没有带任务 id 时默认打开的任务 */
export const defaultTaskId = 139;

/** 任务状态对应的 .key 色块 class */
export const taskStatusKey: Record<TaskStatus, string> = {
  TODO: "",
  DOING: "on",
  BLOCKED: "stuck",
  DONE: "done",
};

/** 优先级得分对应的档位 */
export function getPriorityLabel(score: number): string {
  return score >= 70 ? "高" : score >= 40 ? "中" : "低";
}

/* =========================================================
 * 二、接口假数据
 * ========================================================= */

const { pmA, devA, devB, qaC } = users;

/** 里程碑（阶段） */
export const milestones = {
  A: { id: 1, name: "A 需求分析" },
  B: { id: 2, name: "B 数据库设计" },
  C: { id: 3, name: "C 后端开发" },
  D: { id: 4, name: "D 前端开发" },
  E: { id: 5, name: "E 联调测试" },
};

/** 任务关联的文档（DocumentBrief） */
const documentBriefs: Record<number, DocumentBrief> = {
  1: {
    id: 1,
    name: "需求规格说明书",
    currentVersion: "v1.2",
    status: "FINAL",
    overdueDays: 0,
  },
  2: {
    id: 2,
    name: "数据库设计说明书",
    currentVersion: "v1.1",
    status: "FINAL",
    overdueDays: 0,
  },
  3: {
    id: 3,
    name: "接口文档",
    currentVersion: "v0.6",
    status: "REVISING",
    overdueDays: 2,
  },
  4: {
    id: 4,
    name: "前端组件说明",
    currentVersion: "v0.3",
    status: "REVISING",
    overdueDays: 0,
  },
  5: {
    id: 5,
    name: "测试计划",
    currentVersion: "v0.1",
    status: "REVISING",
    overdueDays: 0,
  },
  7: {
    id: 7,
    name: "周会纪要 10.19",
    currentVersion: "v1.0",
    status: "REVISING",
    overdueDays: 0,
  },
  8: {
    id: 8,
    name: "答辩 PPT",
    currentVersion: "v0.2",
    status: "REVISING",
    overdueDays: 0,
  },
};

/** 一条任务操作记录 */
function taskLog(
  id: number,
  targetId: number,
  user: UserBrief | null,
  action: string,
  detail: string,
  createdAt: string,
): Activity {
  return { id, user, targetType: "TASK", targetId, action, detail, createdAt };
}

/** GET /tasks/{taskId}/activities，按时间倒序 */
export const taskActivities: Record<number, Activity[]> = {
  139: [
    taskLog(
      101,
      139,
      pmA,
      "STATUS",
      "测试经理 A 把任务移到阻塞",
      "2026-10-22 09:30:00",
    ),
    taskLog(
      102,
      139,
      devA,
      "COMMENT",
      "普通员工 A 在讨论里问权限标识格式",
      "2026-10-22 09:18:00",
    ),
    taskLog(103, 139, null, "OVERDUE", "任务逾期", "2026-10-21 00:00:00"),
    taskLog(
      104,
      139,
      pmA,
      "STATUS",
      "测试经理 A 把任务移到进行中",
      "2026-10-19 10:05:00",
    ),
    taskLog(
      105,
      139,
      devA,
      "UPLOAD",
      "普通员工 A 上传接口文档 v0.6",
      "2026-10-18 16:40:00",
    ),
    taskLog(
      106,
      139,
      pmA,
      "CREATE",
      "测试经理 A 创建任务",
      "2026-10-14 09:00:00",
    ),
  ],
  142: [
    taskLog(
      111,
      142,
      pmA,
      "PROGRESS",
      "测试经理 A 更新进度为 70%",
      "2026-10-22 08:50:00",
    ),
    taskLog(
      112,
      142,
      pmA,
      "STATUS",
      "测试经理 A 开始任务",
      "2026-10-19 09:00:00",
    ),
  ],
  137: [
    taskLog(
      121,
      137,
      devB,
      "PROGRESS",
      "普通员工 B 更新进度为 60%",
      "2026-10-22 10:52:00",
    ),
    taskLog(
      122,
      137,
      devB,
      "COMMENT",
      "普通员工 B 发起讨论 甘特图依赖线怎么画",
      "2026-10-21 10:02:00",
    ),
    taskLog(
      123,
      137,
      devB,
      "STATUS",
      "普通员工 B 开始任务",
      "2026-10-20 09:00:00",
    ),
  ],
  135: [
    taskLog(
      131,
      135,
      qaC,
      "UPLOAD",
      "普通员工 C 上传答辩 PPT 第二版",
      "2026-10-21 18:02:00",
    ),
    taskLog(
      132,
      135,
      qaC,
      "COMMENT",
      "普通员工 C 发起讨论 周五彩排时间",
      "2026-10-21 14:00:00",
    ),
  ],
  148: [
    taskLog(
      141,
      148,
      pmA,
      "CREATE",
      "测试经理 A 创建任务",
      "2026-10-20 15:00:00",
    ),
  ],
  144: [
    taskLog(
      151,
      144,
      devA,
      "COMMENT",
      "普通员工 A 发起讨论 菜单接口要不要分页",
      "2026-10-20 16:10:00",
    ),
    taskLog(
      152,
      144,
      pmA,
      "CREATE",
      "测试经理 A 创建任务",
      "2026-10-19 11:00:00",
    ),
  ],
  146: [
    taskLog(
      161,
      146,
      qaC,
      "UPLOAD",
      "普通员工 C 上传周会纪要 10.19",
      "2026-10-19 18:30:00",
    ),
  ],
  150: [
    taskLog(
      171,
      150,
      pmA,
      "CREATE",
      "测试经理 A 新建任务",
      "2026-10-21 15:20:00",
    ),
  ],
  131: [
    taskLog(
      181,
      131,
      pmA,
      "COMMENT",
      "测试经理 A 结束评审讨论",
      "2026-10-17 09:00:00",
    ),
    taskLog(
      182,
      131,
      devB,
      "STATUS",
      "普通员工 B 完成任务",
      "2026-10-17 08:40:00",
    ),
  ],
  129: [
    taskLog(
      191,
      129,
      pmA,
      "STATUS",
      "测试经理 A 完成任务",
      "2026-10-16 17:00:00",
    ),
  ],
  128: [
    taskLog(
      201,
      128,
      devA,
      "STATUS",
      "普通员工 A 完成任务",
      "2026-10-18 15:00:00",
    ),
  ],
};

/** 任务自身的字段；依赖、文档、讨论和时间戳在下面统一拼成 TaskDetail */
interface TaskSeed {
  id: number;
  title: string;
  status: TaskStatus;
  assignee: UserBrief | null;
  milestone: TaskDetail["milestone"];
  score: number;
  critical: boolean;
  progress: number;
  planStart: string;
  dueDate: string;
  planDays: number;
  usedDays: number;
  overdueDays: number;
  actualStart: string | null;
  actualEnd: string | null;
  documentIds: number[];
  description: string;
}

const taskSeeds: TaskSeed[] = [
  {
    id: 139,
    title: "补全接口文档",
    status: "BLOCKED",
    assignee: devA,
    milestone: milestones.C,
    score: 91,
    critical: true,
    progress: 60,
    planStart: "2026-10-19",
    dueDate: "2026-10-20",
    planDays: 2,
    usedDays: 4,
    overdueDays: 2,
    actualStart: "2026-10-19",
    actualEnd: null,
    documentIds: [3],
    description:
      "补齐菜单和权限两部分的接口说明。字段统一用小驼峰，和若依返回的 menuId、parentId 一致；按钮权限标识用 project:task:move 这样的三段式。",
  },
  {
    id: 142,
    title: "权限模块联调",
    status: "DOING",
    assignee: pmA,
    milestone: milestones.C,
    score: 86,
    critical: false,
    progress: 70,
    planStart: "2026-10-19",
    dueDate: "2026-10-22",
    planDays: 4,
    usedDays: 4,
    overdueDays: 0,
    actualStart: "2026-10-19",
    actualEnd: null,
    documentIds: [3],
    description:
      "前后端联调菜单权限和角色权限，确认按钮级权限在看板拖动、调整排期两处生效。",
  },
  {
    id: 137,
    title: "甘特图组件",
    status: "DOING",
    assignee: devB,
    milestone: milestones.D,
    score: 74,
    critical: false,
    progress: 60,
    planStart: "2026-10-20",
    dueDate: "2026-10-23",
    planDays: 4,
    usedDays: 3,
    overdueDays: 0,
    actualStart: "2026-10-20",
    actualEnd: null,
    documentIds: [4],
    description:
      "按工作日画任务条，依赖线用 SVG 按任务条实际位置生成，动画跟着时间轴生长。",
  },
  {
    id: 135,
    title: "答辩 PPT 第二版",
    status: "DOING",
    assignee: qaC,
    milestone: null,
    score: 55,
    critical: false,
    progress: 35,
    planStart: "2026-10-21",
    dueDate: "2026-10-23",
    planDays: 3,
    usedDays: 2,
    overdueDays: 0,
    actualStart: "2026-10-21",
    actualEnd: null,
    documentIds: [8],
    description: "按老师中期意见调整结构，演示放在最后，每人讲五分钟。",
  },
  {
    id: 148,
    title: "按钮权限指令",
    status: "TODO",
    assignee: pmA,
    milestone: milestones.D,
    score: 72,
    critical: false,
    progress: 0,
    planStart: "2026-10-26",
    dueDate: "2026-10-27",
    planDays: 2,
    usedDays: 0,
    overdueDays: 0,
    actualStart: null,
    actualEnd: null,
    documentIds: [],
    description:
      "前端 v-hasPermi 指令按三段式标识隐藏无权限的按钮。等接口文档定下权限标识格式后开始。",
  },
  {
    id: 144,
    title: "菜单接口",
    status: "TODO",
    assignee: devA,
    milestone: milestones.C,
    score: 68,
    critical: true,
    progress: 0,
    planStart: "2026-10-23",
    dueDate: "2026-10-27",
    planDays: 3,
    usedDays: 0,
    overdueDays: 0,
    actualStart: null,
    actualEnd: null,
    documentIds: [3],
    description: "一次返回整棵菜单树，不分页。字段名以接口文档为准。",
  },
  {
    id: 146,
    title: "周会纪要",
    status: "TODO",
    assignee: qaC,
    milestone: null,
    score: 31,
    critical: false,
    progress: 0,
    planStart: "2026-10-22",
    dueDate: "2026-10-22",
    planDays: 1,
    usedDays: 0,
    overdueDays: 0,
    actualStart: null,
    actualEnd: null,
    documentIds: [7],
    description: "记录本周周会结论并上传到文档。",
  },
  {
    id: 150,
    title: "部署脚本",
    status: "TODO",
    assignee: null,
    milestone: milestones.E,
    score: 24,
    critical: false,
    progress: 0,
    planStart: "2026-10-29",
    dueDate: "2026-10-30",
    planDays: 2,
    usedDays: 0,
    overdueDays: 0,
    actualStart: null,
    actualEnd: null,
    documentIds: [5],
    description: "一键打包前后端并部署到学校服务器。",
  },
  {
    id: 131,
    title: "数据库表设计",
    status: "DONE",
    assignee: devB,
    milestone: milestones.B,
    score: 0,
    critical: true,
    progress: 100,
    planStart: "2026-10-17",
    dueDate: "2026-10-17",
    planDays: 1,
    usedDays: 1,
    overdueDays: 0,
    actualStart: "2026-10-17",
    actualEnd: "2026-10-17",
    documentIds: [2],
    description:
      "项目、任务、依赖、文档版本、讨论五张核心表，沿用若依的用户和权限表。",
  },
  {
    id: 129,
    title: "需求分析",
    status: "DONE",
    assignee: pmA,
    milestone: milestones.A,
    score: 0,
    critical: true,
    progress: 100,
    planStart: "2026-10-12",
    dueDate: "2026-10-16",
    planDays: 5,
    usedDays: 5,
    overdueDays: 0,
    actualStart: "2026-10-12",
    actualEnd: "2026-10-16",
    documentIds: [1],
    description: "整理用例和非功能需求，形成需求规格说明书。",
  },
  {
    id: 128,
    title: "登录接口",
    status: "DONE",
    assignee: devA,
    milestone: milestones.C,
    score: 0,
    critical: false,
    progress: 100,
    planStart: "2026-10-16",
    dueDate: "2026-10-18",
    planDays: 2,
    usedDays: 2,
    overdueDays: 0,
    actualStart: "2026-10-16",
    actualEnd: "2026-10-18",
    documentIds: [3],
    description: "沿用若依登录，加登录失败锁定。",
  },
];

/** 依赖关系：[前置任务 id, 后续任务 id]，下标 + 1 作为 dependencyId */
const dependencyPairs: [number, number][] = [
  [129, 131],
  [131, 139],
  [131, 137],
  [139, 144],
  [139, 148],
  [142, 148],
  [128, 142],
];

function toDependency(dependencyId: number, taskId: number): DependencyTask {
  const seed = taskSeeds.find((item) => item.id === taskId)!;
  return {
    dependencyId,
    task: { id: seed.id, taskNo: seed.id, title: seed.title },
    assignee: seed.assignee,
    status: seed.status,
  };
}

function toTaskDetail(seed: TaskSeed, index: number): TaskDetail {
  const { score, documentIds, ...fields } = seed;
  const logs = taskActivities[seed.id];
  return {
    ...fields,
    taskNo: seed.id,
    priority: { label: getPriorityLabel(score), score },
    sortOrder: index,
    parentId: null,
    milestoneId: seed.milestone?.id ?? null,
    projectId: currentProjectId,
    creator: users.pmA,
    importance: 3,
    urgency: 3,
    estHours: seed.planDays * 8,
    requiredSkills: [],
    parent: null,
    predecessors: dependencyPairs.flatMap(([from, to], i) =>
      to === seed.id ? [toDependency(i + 1, from)] : [],
    ),
    successors: dependencyPairs.flatMap(([from, to], i) =>
      from === seed.id ? [toDependency(i + 1, to)] : [],
    ),
    subtasks: [],
    documents: documentIds.map((id) => documentBriefs[id]),
    discussions: discussions.filter((item) => item.task?.id === seed.id),
    createdAt: logs[logs.length - 1].createdAt,
    updatedAt: logs[0].createdAt,
  };
}

/** GET /tasks/{taskId} */
export const taskDetails: Record<number, TaskDetail> = Object.fromEntries(
  taskSeeds.map((seed, index) => [seed.id, toTaskDetail(seed, index)]),
);
