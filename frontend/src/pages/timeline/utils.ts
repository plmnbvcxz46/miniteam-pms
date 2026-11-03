import type { TaskDetail } from "../../types/task";
import {
  addDays,
  dayEnd,
  isWeekend,
  toDateString,
  toDay,
  weekStartTime,
  type AxisRange,
} from "../../utils/date";

/** 关键路径法（CPM）算出的一行，单位都是工作日，从项目第 0 天算起 */
export interface CpmRow {
  /** 最早开始 / 最早完成 */
  es: number;
  ef: number;
  /** 最迟开始 / 最迟完成 */
  ls: number;
  lf: number;
  /** 总时差：晚开始多少天也不影响总工期，0 即在关键路径上 */
  slack: number;
}

export interface CpmResult {
  rows: Record<number, CpmRow>;
  /** 总工期（工作日） */
  total: number;
}

/** 时间线的预测：计划完成日、预测完成日，以及晚了几个工作日 */
export interface TimelineForecast {
  planEnd: string;
  predictedEnd: string;
  delayDays: number;
}


/** date 之后的第 n 个工作日（跳过周六日），n 为 0 返回 date 本身 */
function addWorkdays(date: string, n: number): string {
  let current = date;
  for (let left = n; left > 0;) {
    current = addDays(current, 1);
    if (!isWeekend(current)) left -= 1;
  }
  return current;
}

/**
 * 关键路径法：正推最早时间，倒推最迟时间，总时差 = 最迟开始 − 最早开始。
 * 工期取任务的计划工期，依赖取前置任务。接通算法接口后，这里改读接口返回的结果
 */
export function computeCpm(tasks: TaskDetail[]): CpmResult {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const preds = (task: TaskDetail) =>
    task.predecessors.map((dep) => dep.task.id).filter((id) => byId.has(id));

  const es = new Map<number, number>();
  const earliestStart = (id: number, trail: Set<number>): number => {
    const known = es.get(id);
    if (known !== undefined) return known;
    // 依赖成环时不再往下走，避免死循环（表单已经排除了成环的选项）
    if (trail.has(id)) return 0;
    trail.add(id);
    const task = byId.get(id)!;
    const start = Math.max(
      0,
      ...preds(task).map(
        (pid) => earliestStart(pid, trail) + byId.get(pid)!.planDays,
      ),
    );
    trail.delete(id);
    es.set(id, start);
    return start;
  };
  tasks.forEach((task) => earliestStart(task.id, new Set()));

  const total = Math.max(
    0,
    ...tasks.map((task) => es.get(task.id)! + task.planDays),
  );

  const successors = new Map<number, number[]>();
  tasks.forEach((task) =>
    preds(task).forEach((pid) =>
      successors.set(pid, [...(successors.get(pid) ?? []), task.id]),
    ),
  );

  const lf = new Map<number, number>();
  const latestFinish = (id: number, trail: Set<number>): number => {
    const known = lf.get(id);
    if (known !== undefined) return known;
    if (trail.has(id)) return total;
    trail.add(id);
    const finish = Math.min(
      total,
      ...(successors.get(id) ?? []).map(
        (sid) => latestFinish(sid, trail) - byId.get(sid)!.planDays,
      ),
    );
    trail.delete(id);
    lf.set(id, finish);
    return finish;
  };

  const rows: Record<number, CpmRow> = {};
  for (const task of tasks) {
    const start = es.get(task.id)!;
    const finish = latestFinish(task.id, new Set());
    rows[task.id] = {
      es: start,
      ef: start + task.planDays,
      ls: finish - task.planDays,
      lf: finish,
      slack: finish - task.planDays - start,
    };
  }
  return { rows, total };
}

/** 画在时间线上的任务：有排期的，按开始日排，同一天按编号 */
export function getTimelineTasks(
  taskMap: Record<number, TaskDetail>,
): TaskDetail[] {
  return Object.values(taskMap)
    .filter((task) => task.planStart && task.dueDate)
    .sort(
      (a, b) =>
        toDay(a.planStart!) - toDay(b.planStart!) || a.taskNo - b.taskNo,
    );
}

/**
 * 预测：关键路径上未完成的任务里逾期最多的那个，把整个项目往后拖几天。
 * 这是前端的估算，后端的进度预测算法接通后改读接口
 */
export function getForecast(
  tasks: TaskDetail[],
  cpm: CpmResult,
): TimelineForecast {
  const planEnd = tasks.reduce(
    (latest, task) => (task.dueDate! > latest ? task.dueDate! : latest),
    tasks[0]?.dueDate ?? "",
  );
  const delayDays = Math.max(
    0,
    ...tasks
      .filter((task) => task.status !== "DONE" && cpm.rows[task.id].slack === 0)
      .map((task) => task.overdueDays),
  );
  return {
    planEnd,
    predictedEnd: planEnd ? addWorkdays(planEnd, delayDays) : planEnd,
    delayDays,
  };
}

/**
 * 时间线的横轴范围：从最早的开始日（或今天）所在周的周一，
 * 到最晚的截止 / 预测 / 今天所在周的周日 24:00，整周整周地铺满
 */
export function getTimelineRange(
  tasks: TaskDetail[],
  forecast: TimelineForecast,
  today: string,
): AxisRange {
  const starts = [today, ...tasks.map((task) => task.planStart!)];
  const ends = [
    today,
    forecast.predictedEnd,
    ...tasks.map((task) => task.dueDate!),
  ].filter(Boolean);
  const first = Math.min(...starts.map(toDay));
  const last = Math.max(...ends.map(dayEnd)) - 1;
  return { start: weekStartTime(first), end: weekStartTime(last) + 7 };
}

/** 范围内每周的周一（yyyy-MM-dd） */
export function getWeekStarts(range: AxisRange): string[] {
  const weeks = Math.round((range.end - range.start) / 7);
  return Array.from({ length: weeks }, (_, i) =>
    toDateString(range.start + i * 7),
  );
}
