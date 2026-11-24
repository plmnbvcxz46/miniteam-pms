import type { CSSProperties } from "react";
import type { Burndown } from "../../shared/types/reports";
import { addDays, formatDayLabel, toDay } from "../../shared/utils/date";
import { toMonthDay } from "./utils";

/** 坐标系（viewBox 0 0 815 262）：横轴 50 到 790，纵轴 0 在 214、最大值在 18 */
export const BURNDOWN_VIEWBOX = "0 0 815 262";
export const X0 = 50;
export const X_WIDTH = 740;
export const Y_ZERO = 214;
export const Y_HEIGHT = 196;
const DRAW_SECONDS = 1.1;
const LABEL_FONT = 11;

type Pt = [number, number];

export interface LabelSpan {
  x: number;
  end: boolean;
  l: number;
  r: number;
}

export interface BurndownModel {
  gridLines: { value: number; y: number }[];
  xLabels: { d: number; x: number; text: string }[];
  yTop: number;
  yZero: number;
  planPath: string;
  actualPath: string;
  predPath: string;
  planStyle: CSSProperties;
  actualStyle: CSSProperties;
  predStyle: CSSProperties;
  todayX: number;
  todayVal: number | null;
  todayValY: number;
  isDelay: boolean;
  showEnds: boolean;
  plannedX: number;
  predictedX: number;
  plannedText: string;
  predictedText: string;
  plannedSpan: LabelSpan;
  predictedSpan: LabelSpan;
  endsOverlap: boolean;
  mergedEndX: number;
  endsGap: number;
  ariaLabel: string;
}

function toPath(pts: Pt[], xAt: (d: number) => number, yAt: (v: number) => number): string {
  if (pts.length === 0) return "";
  return "M" + pts.map((p) => `${xAt(p[0]).toFixed(1)} ${yAt(p[1]).toFixed(1)}`).join(" L");
}

function buildDrawStyle(pts: Pt[], unit: number): CSSProperties {
  const first = pts[0]?.[0] ?? 0;
  const last = pts[pts.length - 1]?.[0] ?? 0;
  return {
    "--d": `${(first * unit).toFixed(3)}s`,
    "--dur": `${((last - first) * unit).toFixed(3)}s`,
  } as CSSProperties;
}

function measureTextWidth(text: string): number {
  return [...text].reduce(
    (w, ch) => w + (ch.charCodeAt(0) > 255 ? LABEL_FONT : LABEL_FONT * 0.6),
    0,
  );
}

function computeEndLabels(
  plannedX: number,
  predictedX: number,
  plannedText: string,
  predictedText: string,
) {
  const plannedW = measureTextWidth(plannedText);
  const predictedW = measureTextWidth(predictedText);
  const left = plannedX - 4 - plannedW;
  const plannedSpan: LabelSpan =
    left >= 0
      ? { x: plannedX - 4, end: true, l: left, r: plannedX - 4 }
      : { x: plannedX + 6, end: false, l: plannedX + 6, r: plannedX + 6 + plannedW };
  const right = predictedX + 6 + predictedW;
  const predictedSpan: LabelSpan =
    right <= 815
      ? { x: predictedX + 6, end: false, l: predictedX + 6, r: right }
      : { x: predictedX - 4, end: true, l: predictedX - 4 - predictedW, r: predictedX - 4 };
  const endsGap = LABEL_FONT;
  const endsOverlap =
    plannedSpan.l < predictedSpan.r + endsGap && predictedSpan.l < predictedSpan.r + endsGap;
  const mergedEndX = Math.min(815, Math.max(plannedX, predictedX) + 4);
  return { plannedSpan, predictedSpan, endsGap, endsOverlap, mergedEndX };
}

export function buildBurndownModel(burndown: Burndown): BurndownModel | null {
  const { points } = burndown;
  if (points.length === 0) return null;

  const start = points[0].date;
  const dayOf = (date: string) => toDay(date) - toDay(start);
  const lastDay = Math.max(...points.map((p) => dayOf(p.date)));
  const plannedDay = dayOf(burndown.plannedEnd);
  const predictedDay = dayOf(burndown.predictedEnd);
  const showEnds = plannedDay <= lastDay + 1 && predictedDay <= lastDay + 1;
  const span = Math.max(lastDay, 1);
  const unit = DRAW_SECONDS / span;

  const peak = Math.max(...points.flatMap((p) => [p.planned, p.actual ?? 0, p.predicted ?? 0]));
  const yMax = Math.max(2, Math.ceil(peak / 2) * 2);
  const xAt = (d: number) => X0 + d * (X_WIDTH / span);
  const yAt = (v: number) => Y_ZERO - v * (Y_HEIGHT / yMax);

  const step = span <= 10 ? 1 : 7;
  const xLabels = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => ({
    d: i * step,
    x: xAt(i * step),
    text: formatDayLabel(addDays(start, i * step)),
  }));

  const planPts: Pt[] = points.map((p) => [dayOf(p.date), p.planned]);
  const actualPts: Pt[] = points
    .filter((p) => p.actual !== null)
    .map((p) => [dayOf(p.date), p.actual as number]);
  const predPts: Pt[] = points
    .filter((p) => p.predicted !== null)
    .map((p) => [dayOf(p.date), p.predicted as number]);

  const todayD = dayOf(burndown.today);
  const todayVal = points.find((p) => p.date === burndown.today)?.actual ?? null;
  const todayValY =
    todayVal === null
      ? Y_ZERO
      : yAt(todayVal) - 12 < yAt(yMax) + 14
        ? yAt(todayVal) + 20
        : yAt(todayVal) - 12;

  const isDelay = burndown.predictedEnd > burndown.plannedEnd;
  const plannedEndLabel = toMonthDay(burndown.plannedEnd);
  const predictedEndLabel = toMonthDay(burndown.predictedEnd, false);
  const plannedText = `计划 ${plannedEndLabel}`;
  const predictedText = `预测 ${predictedEndLabel}`;
  const plannedX = xAt(plannedDay);
  const predictedX = xAt(predictedDay);
  const endLabels = computeEndLabels(plannedX, predictedX, plannedText, predictedText);

  return {
    gridLines: [0, yMax / 2, yMax].map((value) => ({ value, y: yAt(value) })),
    xLabels,
    yTop: yAt(yMax),
    yZero: yAt(0),
    planPath: toPath(planPts, xAt, yAt),
    actualPath: toPath(actualPts, xAt, yAt),
    predPath: toPath(predPts, xAt, yAt),
    planStyle: buildDrawStyle(planPts, unit),
    actualStyle: buildDrawStyle(actualPts, unit),
    predStyle: buildDrawStyle(predPts, unit),
    todayX: xAt(todayD),
    todayVal,
    todayValY,
    isDelay,
    showEnds,
    plannedX,
    predictedX,
    plannedText,
    predictedText,
    ...endLabels,
    ariaLabel: `燃尽图：${isDelay ? "实际进度落后计划" : "实际进度不落后计划"}，预测 ${predictedEndLabel} 完成，计划 ${plannedEndLabel}`,
  };
}
