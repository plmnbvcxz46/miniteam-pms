import { getPriorityLabel } from "../../data/task";
import type { Priority, TaskDetail } from "../../types/task";
import { daysBetween } from "../../utils/date";

/** 优先级评分用到的系统参数 */
export interface PriorityConfig {
  weights: { importance: number; urgency: number; time: number; block: number };
  /** 阻塞影响度里，在关键路径上的任务额外加多少 */
  alpha: number;
}

/** 从系统参数（key → 字符串）里读出评分用的权重，缺了或不是数字时用后端种子里的默认值 */
export function readPriorityConfig(values: Record<string, string>): PriorityConfig {
  const read = (key: string, fallback: number) => {
    const n = Number(values[key]);
    return values[key]?.trim() !== "" && Number.isFinite(n) ? n : fallback;
  };
  return {
    weights: {
      importance: read("priority.weight.importance", 0.3),
      urgency: read("priority.weight.urgency", 0.3),
      time: read("priority.weight.time", 0.25),
      block: read("priority.weight.block", 0.15),
    },
    alpha: read("priority.alpha", 0.5),
  };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * 任务优先级评分（开题报告 4. 算法设计，式 3.1 到 3.3），已完成的任务不参与：
 * - 时间紧迫度 u = norm(预估工期 D / 剩余天数 R)，已到期或逾期（R ≤ 0）取 1
 * - 阻塞影响度 b = 被依赖的未完成任务数 + α × 关键路径指示（在关键路径上为 1，否则 0）
 * - 综合得分 S = (w1·重要度 + w2·紧急度 + w3·u + w4·b) / (w1+w2+w3+w4) × 100
 * 文档没写 norm() 的算法，这里取：重要度和紧急度 1 到 5 映射到 0 到 1，
 * u 超过 1 按 1 算，b 除以所有未完成任务里最大的 b。接口接通后得分由后端算
 */
export function calculatePriorities(
  tasks: TaskDetail[],
  today: string,
  config: PriorityConfig,
): Record<number, Priority> {
  const open = tasks.filter((task) => task.status !== "DONE");
  const rawBlock = (task: TaskDetail) =>
    task.successors.filter((dep) => dep.status !== "DONE").length +
    (task.critical ? config.alpha : 0);
  const maxBlock = Math.max(0, ...open.map(rawBlock));
  const { importance, urgency, time, block } = config.weights;
  const weightSum = importance + urgency + time + block;

  const result: Record<number, Priority> = {};
  for (const task of open) {
    const remaining = task.dueDate ? daysBetween(today, task.dueDate) : null;
    const u =
      remaining === null
        ? 0
        : remaining <= 0
          ? 1
          : clamp01(task.planDays / remaining);
    const b = maxBlock > 0 ? clamp01(rawBlock(task) / maxBlock) : 0;
    const weighted =
      importance * clamp01((task.importance - 1) / 4) +
      urgency * clamp01((task.urgency - 1) / 4) +
      time * u +
      block * b;
    const score = weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 0;
    result[task.id] = { label: getPriorityLabel(score), score };
  }
  return result;
}
