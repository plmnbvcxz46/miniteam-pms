/** 工时条坐标轴的最小刻度（小时），超过时按 10 小时向上取整放大 */
export const DEFAULT_LOAD_SCALE = 50;

/** 一组成员共用的工时坐标轴最大值：保证最高的工时和上限都画得下 */
export function getLoadScale(hours: number[], capacities: number[]): number {
  const peak = Math.max(0, ...hours, ...capacities);
  return Math.max(DEFAULT_LOAD_SCALE, Math.ceil(peak / 10) * 10);
}

/**
 * 计算成员工时条各段的百分比和动效参数
 * 上限虚线落在 capacity / maxScale 处，超出上限的部分接在虚线后面
 */
export function calculateLoadBar(
  hours: number,
  capacity: number,
  maxScale = DEFAULT_LOAD_SCALE,
): {
  capPercent: number;
  fillPercent: number;
  fillDur: string;
  overPercent: number;
  overLeftPercent: number;
  overDelay: string;
  overDur: string;
  isOver: boolean;
} {
  const safeCap = Math.max(capacity, 1);
  const safeMax = Math.max(maxScale, safeCap);

  const main = Math.min(hours, safeCap);
  const over = Math.max(0, hours - safeCap);

  const capPercent = (safeCap / safeMax) * 100;
  const fillPercent = (main / safeMax) * 100;
  const fillDur = ((main / safeMax) * 0.6).toFixed(2);

  const overPercent = Math.min((over / safeMax) * 100, 100 - capPercent);
  const overDelay = ((safeCap / safeMax) * 0.6).toFixed(2);
  const overDur = ((over / safeMax) * 0.6).toFixed(2);

  return {
    capPercent,
    fillPercent,
    fillDur,
    overPercent,
    overLeftPercent: capPercent,
    overDelay,
    overDur,
    isOver: over > 0,
  };
}
