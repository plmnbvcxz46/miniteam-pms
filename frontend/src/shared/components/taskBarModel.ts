import type { Activity } from "../types/global";
import type { TaskDetail } from "../types/task";
import {
  dayEnd,
  getAxisRange,
  parseDateTime,
  toDay,
  type AxisRange,
  type DayTime,
} from "../utils/date";

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
  /** 今天 00:00 */
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
  "status" | "planStart" | "dueDate" | "actualEnd"
>;

/**
 * 从操作记录推算阻塞区间：进入阻塞 → 离开阻塞，可能有多段。
 * 记录里只有展示文案（“把任务移到阻塞”），没有结构化的前后状态，接通接口后改读状态字段。
 * 还没离开的阻塞，to 为 Infinity，由调用方按今天截断
 */
export function getBlockedSpans(activities: Activity[]): TimeSpan[] {
  const events = activities
    .filter((item) => item.targetType === "TASK" && item.action === "STATUS")
    .map((item) => ({
      time: parseDateTime(item.createdAt),
      toBlocked: item.detail.includes("阻塞"),
    }))
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

/**
 * 任务条的几何：主体始终是计划区间（开始日 00:00 ～ 截止日 24:00），逾期段追加在右侧。
 * 状态取任务的状态字段，只有逾期由日期判断：今天 > 截止日且未完成，或完成日 > 截止日
 * @param pad 时间轴两端留白的天数，概览小条传 0
 * @param sharedRange 多个任务条共用一条时间轴（时间线页）时传入，覆盖按单个任务算的范围
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
  const now = toDay(today);
  const range = sharedRange ?? getAxisRange(task, today, pad);

  const frames: BarFrame[] = [];
  const fills: BarFill[] = [];
  let unused: TimeSpan | null = null;
  let done: TaskBarModel["done"] = null;

  const blocked = getBlockedSpans(activities);
  const addBlocked = (limit: TimeSpan, kind: BarFill["kind"]) => {
    for (const span of blocked) {
      const part = clip(span, limit);
      if (part) fills.push({ ...part, kind });
    }
  };

  if (task.status === "DONE") {
    // 没记录完成日的（旧数据）按今天完成
    const finishedDate = task.actualEnd ?? today;
    const finished = dayEnd(finishedDate);
    const bodyEnd = Math.min(finished, due);
    done = { at: finished, date: finishedDate };

    frames.push({ from: start, to: bodyEnd, dashed: true, tail: false });
    addBlocked({ from: start, to: bodyEnd }, "past");
    if (finished > due) {
      // 逾期段最多画到今天 00:00，和未完成任务的逾期段一致；今天完成的，完成标记仍在今天 24:00
      const tailEnd = Math.min(finished, Math.max(due, now));
      frames.push({ from: due, to: tailEnd, dashed: true, tail: true });
      fills.push({ from: due, to: tailEnd, kind: "past" });
    } else if (finished < due) {
      unused = { from: finished, to: due };
    }
  } else {
    frames.push({ from: start, to: due, dashed: false, tail: false });
    if (task.status === "DOING" || task.status === "BLOCKED") {
      const elapsed = { from: start, to: Math.min(now, due) };
      if (elapsed.to > elapsed.from) {
        fills.push({ ...elapsed, kind: "ink" });
        addBlocked(elapsed, "warn");
      }
    }
    if (now > due) {
      frames.push({ from: due, to: now, dashed: false, tail: true });
      fills.push({ from: due, to: now, kind: "warn" });
    }
  }

  return {
    range,
    today: now,
    frames,
    fills,
    unused,
    due: { at: due, date: task.dueDate },
    done,
  };
}
