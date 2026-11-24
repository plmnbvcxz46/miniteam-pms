/** 时间线的预测：计划完成日、预测完成日，以及晚了几个工作日 */
export interface TimelineForecast {
  planEnd: string;
  predictedEnd: string;
  delayDays: number;
}

/** 接口的预测（甘特图、关键路径、总览里都带）换成时间线和总览用的形状 */
export function toForecast(f: {
  plannedEnd: string;
  predictedEnd: string;
  delayDays: number;
}): TimelineForecast {
  return {
    planEnd: f.plannedEnd,
    predictedEnd: f.predictedEnd,
    delayDays: f.delayDays,
  };
}
