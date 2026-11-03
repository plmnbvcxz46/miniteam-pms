import { currentProjectId, users } from "../../data/global";
import { getPriorityLabel, milestones } from "../../data/task";
import type { TaskStatus, UserBrief } from "../../types/global";
import type {
  DependencyTask,
  TaskDetail,
  TaskFormValues,
} from "../../types/task";
import { applyTaskStatus, getDueDate } from "./task/utils";

/** 某一列的任务，按列内顺序排列 */
export function getColumnTasks(
  tasks: Record<number, TaskDetail>,
  status: TaskStatus,
): TaskDetail[] {
  return Object.values(tasks)
    .filter((task) => task.status === status)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** 把任务移到目标列的第 index 位，返回新的任务表 */
export function moveTaskTo(
  tasks: Record<number, TaskDetail>,
  taskId: number,
  status: TaskStatus,
  index: number,
  today: string,
): Record<number, TaskDetail> {
  const moved =
    tasks[taskId].status === status
      ? tasks
      : applyTaskStatus(tasks, taskId, status, today);

  const ids = getColumnTasks(moved, status)
    .map((task) => task.id)
    .filter((id) => id !== taskId);
  ids.splice(index, 0, taskId);

  const next = { ...moved };
  ids.forEach((id, sortOrder) => {
    next[id] = { ...next[id], sortOrder };
  });
  return next;
}

/**
 * 看板上能看到哪些任务：有“编辑任务”权限的看全部，
 * 其他人只看自己负责的，加上关键路径上别人的任务（只读）
 */
export function isTaskVisible(
  task: TaskDetail,
  userId: number,
  canEditTask: boolean,
): boolean {
  return canEditTask || task.critical || task.assignee?.id === userId;
}

/** 能不能改任务的状态：有“编辑任务”权限的改任何人的，其他人只能改自己负责的 */
export function canMoveTask(
  task: TaskDetail,
  userId: number,
  canEditTask: boolean,
): boolean {
  return canEditTask || task.assignee?.id === userId;
}

/**
 * 列里有些任务被隐藏时，把“在可见卡片里的第几位”换算成“在整列里的第几位”，
 * 这样落在末尾就还是整列的末尾
 */
export function toFullIndex(
  tasks: Record<number, TaskDetail>,
  movedId: number,
  target: { status: TaskStatus; index: number },
  isShown: (task: TaskDetail) => boolean,
): number {
  const column = getColumnTasks(tasks, target.status).filter(
    (task) => task.id !== movedId,
  );
  const before = column.filter(isShown)[target.index];
  return before ? column.findIndex((task) => task.id === before.id) : column.length;
}

/** 被阻塞任务拖住、还没完成的后续任务，去重 */
export function getBlockedTasks(
  tasks: Record<number, TaskDetail>,
): TaskDetail[] {
  const ids = getColumnTasks(tasks, "BLOCKED").flatMap((task) =>
    task.successors
      .filter((dep) => dep.status !== "DONE")
      .map((dep) => dep.task.id),
  );
  return [...new Set(ids)].map((id) => tasks[id]);
}

/** 前置任务的可选项：未完成的任务加已选的，排除自身和下游任务以免成环 */
export function getPredecessorOptions(
  tasks: Record<number, TaskDetail>,
  task: TaskDetail | null,
): TaskDetail[] {
  const excluded = new Set<number>();
  const collect = (id: number) => {
    if (excluded.has(id)) return;
    excluded.add(id);
    tasks[id].successors.forEach((dep) => collect(dep.task.id));
  };
  if (task) collect(task.id);

  const selected = task?.predecessors.map((dep) => dep.task.id) ?? [];
  return Object.values(tasks).filter(
    (item) =>
      !excluded.has(item.id) &&
      (item.status !== "DONE" || selected.includes(item.id)),
  );
}

function toDependency(dependencyId: number, task: TaskDetail): DependencyTask {
  return {
    dependencyId,
    task: { id: task.id, taskNo: task.taskNo, title: task.title },
    assignee: task.assignee,
    status: task.status,
  };
}

/** 把新建或修改后的任务写回任务表，并同步其他任务的前置 / 后续列表 */
function writeTask(
  tasks: Record<number, TaskDetail>,
  task: TaskDetail,
  predecessorIds: number[],
): Record<number, TaskDetail> {
  const allDeps = Object.values(tasks).flatMap((item) => item.predecessors);
  let nextDependencyId =
    Math.max(0, ...allDeps.map((dep) => dep.dependencyId)) + 1;

  const predecessors = predecessorIds.map((id) => {
    const kept = task.predecessors.find((dep) => dep.task.id === id);
    return kept ?? toDependency(nextDependencyId++, tasks[id]);
  });

  const next: Record<number, TaskDetail> = {};
  Object.values(tasks).forEach((item) => {
    if (item.id === task.id) return;
    const link = predecessors.find((dep) => dep.task.id === item.id);
    next[item.id] = {
      ...item,
      predecessors: item.predecessors.map((dep) =>
        dep.task.id === task.id ? toDependency(dep.dependencyId, task) : dep,
      ),
      successors: [
        ...item.successors.filter((dep) => dep.task.id !== task.id),
        ...(link ? [toDependency(link.dependencyId, task)] : []),
      ],
    };
  });
  next[task.id] = { ...task, predecessors };
  return next;
}

/** 表单的值转成任务字段 */
function toTaskFields(values: TaskFormValues) {
  const assignee =
    Object.values(users).find((user) => user.id === values.assigneeId) ?? null;
  const milestone =
    Object.values(milestones).find((m) => m.id === values.milestoneId) ?? null;
  return {
    title: values.title,
    description: values.description,
    milestone,
    milestoneId: milestone?.id ?? null,
    assignee,
    planStart: values.planStart,
    planDays: values.planDays,
    dueDate: getDueDate(values.planStart, values.planDays),
    estHours: values.planDays * 8,
  };
}

/** 新建任务，放到待开始列最上面。优先级接通接口后由后端计算 */
export function createTask(
  tasks: Record<number, TaskDetail>,
  taskId: number,
  values: TaskFormValues,
  today: string,
  creator: UserBrief,
): Record<number, TaskDetail> {
  const score = 50 + values.predecessorIds.length * 10;
  const createdAt = `${today} 刚刚`;
  const task: TaskDetail = {
    ...toTaskFields(values),
    id: taskId,
    taskNo: taskId,
    status: "TODO",
    progress: 0,
    priority: { label: getPriorityLabel(score), score },
    critical: false,
    overdueDays: 0,
    sortOrder: 0,
    parentId: null,
    actualEnd: null,
    projectId: currentProjectId,
    creator,
    importance: 3,
    urgency: 3,
    usedDays: 0,
    requiredSkills: [],
    actualStart: null,
    parent: null,
    predecessors: [],
    successors: [],
    subtasks: [],
    documents: [],
    discussions: [],
    createdAt,
    updatedAt: createdAt,
  };
  const written = writeTask(tasks, task, values.predecessorIds);
  const synced = applyTaskStatus(written, taskId, "TODO", today);
  return moveTaskTo(synced, taskId, "TODO", 0, today);
}

/** 保存对任务的修改，并重算已用和逾期天数 */
export function updateTask(
  tasks: Record<number, TaskDetail>,
  taskId: number,
  values: TaskFormValues,
  today: string,
): Record<number, TaskDetail> {
  const task = {
    ...tasks[taskId],
    ...toTaskFields(values),
    updatedAt: `${today} 刚刚`,
  };
  const written = writeTask(tasks, task, values.predecessorIds);
  return applyTaskStatus(written, taskId, task.status, today);
}
