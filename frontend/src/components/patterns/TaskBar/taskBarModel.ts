import type { Activity } from "../../../shared/types/global";
import type { DependencyTask, TaskDetail } from "../../../shared/types/task";
import {
  dayEnd,
  getAxisRange,
  parseDateTime,
  toDay,
  type AxisRange,
  type DayTime,
} from "../../../shared/utils/date.ts";

/** 一段时间：[from, to) */
export interface TimeSpan {
  from: DayTime;
  to: DayTime;
}

/**
 * 框内填充：
 * ink 实心黑（正常用掉的时间）/ warn 橙色斜纹（阻塞、逾期，未完成）/ past 黑色斜纹（已完成任务的历史异常）
 */
export interface BarFill extends TimeSpan {
  kind: "ink" | "warn" | "past";
}

/** 描边框：tail 是主体右侧追加的逾期段，不画左边框 */
export interface BarFrame extends TimeSpan {
  dashed: boolean;
  tail: boolean;
}

export interface TaskBarModel {
  range: AxisRange;
  /** 今天 24:00：按天画的图都把今天算作已过完，今天线、填充、逾期段都到这里 */
  today: DayTime;
  frames: BarFrame[];
  fills: BarFill[];
  /** 提前完成时计划了但没用掉的时间 */
  unused: TimeSpan | null;
  /** 截止线，在截止日 24:00 */
  due: { at: DayTime; date: string } | null;
  /** 完成标记，在完成日 24:00 */
  done: { at: DayTime; date: string } | null;
}

/** 生成任务条需要的任务字段 */
export type TaskBarTask = Pick<
  TaskDetail,
  "status" | "planStart" | "dueDate" | "actualStart" | "actualEnd"
> & {
  predecessors?: Pick<DependencyTask, "status">[];
};

/** 从操作记录推算阻塞区间：进入阻塞 → 离开阻塞，可能有多段 */
export function getBlockedSpans(
  activities: Activity[],
  actualStart?: string | null,
): TimeSpan[] {
  const events = activities
    .filter((item) => item.targetType === "TASK" && item.action === "STATUS")
    .map((item) => {
      const toBlocked = item.detail.includes("阻塞");
      const auto =
        toBlocked &&
        item.user === null &&
        Boolean(actualStart) &&
        item.detail.startsWith("到了计划开始日");
      return {
        time:
          auto && actualStart ? toDay(actualStart) : parseDateTime(item.createdAt),
        toBlocked,
      };
    })
    .sort((a, b) => a.time - b.time);

  const spans: TimeSpan[] = [];
  let from: DayTime | null = null;
  for (const event of events) {
    if (event.toBlocked) {
      from ??= event.time;
    } else if (from !== null) {
      spans.push({ from, to: event.time });
      from = null;
    }
  }
  if (from !== null) spans.push({ from, to: Infinity });
  return spans;
}

/** 取两个区间的交集，没有交集返回 null */
function clip(span: TimeSpan, limit: TimeSpan): TimeSpan | null {
  const from = Math.max(span.from, limit.from);
  const to = Math.min(span.to, limit.to);
  return to > from ? { from, to } : null;
}

function collectBlockedFills(
  blocked: TimeSpan[],
  limit: TimeSpan,
  kind: BarFill["kind"],
): BarFill[] {
  const fills: BarFill[] = [];
  for (const span of blocked) {
    const part = clip(span, limit);
    if (part) fills.push({ ...part, kind });
  }
  return fills;
}

function buildDoneSegments(
  task: TaskBarTask,
  today: string,
  start: DayTime,
  due: DayTime,
  blocked: TimeSpan[],
) {
  const finishedDate = task.actualEnd ?? today;
  const finished = dayEnd(finishedDate);
  const bodyEnd = Math.min(finished, due);
  const frames: BarFrame[] = [{ from: start, to: bodyEnd, dashed: true, tail: false }];
  const fills: BarFill[] = collectBlockedFills(
    blocked,
    { from: start, to: bodyEnd },
    "past",
  );
  let unused: TimeSpan | null = null;

  if (finished > due) {
    frames.push({ from: due, to: finished, dashed: true, tail: true });
    fills.push({ from: due, to: finished, kind: "past" });
  } else if (finished < due) {
    unused = { from: finished, to: due };
  }

  return {
    frames,
    fills,
    unused,
    done: { at: finished, date: finishedDate },
  };
}

function buildActiveSegments(
  task: TaskBarTask,
  start: DayTime,
  due: DayTime,
  now: DayTime,
  blocked: TimeSpan[],
) {
  const frames: BarFrame[] = [{ from: start, to: due, dashed: false, tail: false }];
  const fills: BarFill[] = [];
  const hasUnfinishedPredecessor =
    task.predecessors?.some((p) => p.status !== "DONE") ?? false;
  const elapsed = { from: start, to: Math.min(now, due) };

  if (task.status === "DOING" || task.status === "BLOCKED") {
    if (elapsed.to > elapsed.from) {
      fills.push({ ...elapsed, kind: "ink" });
      fills.push(...collectBlockedFills(blocked, elapsed, "warn"));
    }
  } else if (task.status === "TODO" && hasUnfinishedPredecessor) {
    // 待开始但已到计划开始日且存在未完成前置，兜底从计划开始日按阻塞画斜纹
    if (elapsed.to > elapsed.from) {
      fills.push({ ...elapsed, kind: "warn" });
    }
  }

  if (now > due) {
    frames.push({ from: due, to: now, dashed: false, tail: true });
    fills.push({ from: due, to: now, kind: "warn" });
  }

  return { frames, fills, unused: null, done: null };
}

/**
 * 任务条几何模型：主体为计划区间（开始日 00:00 ～ 截止日 24:00），逾期段追加在右侧。
 */
export function buildTaskBar(
  task: TaskBarTask,
  activities: Activity[],
  today: string,
  pad?: number,
  sharedRange?: AxisRange,
): TaskBarModel | null {
  if (!task.planStart || !task.dueDate) return null;

  const start = toDay(task.planStart);
  const due = dayEnd(task.dueDate);
  const now = dayEnd(today);
  const range = sharedRange ?? getAxisRange(task, today, pad);

  const blocked = getBlockedSpans(activities, task.actualStart);
  if (
    task.status === "BLOCKED" &&
    !blocked.some((span) => span.to === Infinity)
  ) {
    // 处于阻塞状态但缺少对应 STATUS 动态（如旧数据或动态截断），兜底从计划开始日画阻塞斜纹
    blocked.push({ from: start, to: Infinity });
  }

  const segments =
    task.status === "DONE"
      ? buildDoneSegments(task, today, start, due, blocked)
      : buildActiveSegments(task, start, due, now, blocked);

  return {
    range,
    today: now,
    ...segments,
    due: { at: due, date: task.dueDate },
  };
}
