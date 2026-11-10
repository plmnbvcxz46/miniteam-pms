import { useId } from "react";
import type { Burndown } from "../../../shared/types/reports";
import { addDays, formatDayLabel, toDay } from "../../../shared/utils/date";
import { toMonthDay } from "../utils";

interface BurndownChartProps {
  burndown: Burndown;
}

/** 坐标系（viewBox 0 0 815 262）：横轴 50 到 790，纵轴 0 在 214、最大值在 18 */
const X0 = 50;
const X_WIDTH = 740;
const Y_ZERO = 214;
const Y_HEIGHT = 196;
/** 整根线画完的总时长（秒），按天数均分给每一段 */
const DRAW_SECONDS = 1.1;

type Pt = [number, number];

export default function BurndownChart({ burndown }: BurndownChartProps) {
  const maskPrefix = useId().replace(/:/g, "_");
  const { points } = burndown;
  if (points.length === 0) return null;

  // 横轴按天：从第一个点算起，画到最后一个点、计划完工和预测完工里最晚的那天；
  // 完工日不在这一段时间里（例如只看本周）就不画完工标记
  const start = points[0].date;
  const dayOf = (date: string) => toDay(date) - toDay(start);
  const lastDay = Math.max(...points.map((p) => dayOf(p.date)));
  const plannedDay = dayOf(burndown.plannedEnd);
  const predictedDay = dayOf(burndown.predictedEnd);
  const showEnds = plannedDay <= lastDay + 1 && predictedDay <= lastDay + 1;
  const span = Math.max(lastDay, 1);
  const unit = DRAW_SECONDS / span;

  // 纵轴最大值取所有线里最高的，向上取偶数，网格线画 0、一半、最大值
  const peak = Math.max(
    ...points.flatMap((p) => [p.planned, p.actual ?? 0, p.predicted ?? 0]),
  );
  const yMax = Math.max(2, Math.ceil(peak / 2) * 2);
  const gridValues = [0, yMax / 2, yMax];

  const X = (d: number) => X0 + d * (X_WIDTH / span);
  const Y = (v: number) => Y_ZERO - v * (Y_HEIGHT / yMax);

  // 横轴刻度：天数少时每天一个，否则每周一个
  const step = span <= 10 ? 1 : 7;
  const xLabels = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => ({
    d: i * step,
    text: formatDayLabel(addDays(start, i * step)),
  }));

  // 三条线的点：计划线画全程，实际线只有今天之前，预测线只有今天之后
  const planPts: Pt[] = points.map((p) => [dayOf(p.date), p.planned]);
  const actualPts: Pt[] = points
    .filter((p) => p.actual !== null)
    .map((p) => [dayOf(p.date), p.actual as number]);
  const predPts: Pt[] = points
    .filter((p) => p.predicted !== null)
    .map((p) => [dayOf(p.date), p.predicted as number]);

  const todayD = dayOf(burndown.today);
  const todayVal = points.find((p) => p.date === burndown.today)?.actual ?? null;
  const isDelay = burndown.predictedEnd > burndown.plannedEnd;

  const toPath = (pts: Pt[]) =>
    pts.length === 0
      ? ""
      : "M" + pts.map((p) => `${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" L");
  const planPath = toPath(planPts);
  const actualPath = toPath(actualPts);
  const predPath = toPath(predPts);

  const draw = (pts: Pt[]) => {
    const first = pts[0]?.[0] ?? 0;
    const last = pts[pts.length - 1]?.[0] ?? 0;
    return {
      "--d": `${(first * unit).toFixed(3)}s`,
      "--dur": `${((last - first) * unit).toFixed(3)}s`,
    } as React.CSSProperties;
  };

  const planMaskId = `${maskPrefix}_plan`;
  const actMaskId = `${maskPrefix}_act`;
  const predMaskId = `${maskPrefix}_pred`;

  const plannedEndLabel = toMonthDay(burndown.plannedEnd);
  const predictedEndLabel = toMonthDay(burndown.predictedEnd, false);

  // 完工日期文字排版：等宽字体按字符数估算宽度（中文占一个字宽，其余约 0.6 个字宽），
  // 默认计划靠左、预测靠右跟着各自的标记；靠近图边界时翻到另一侧，两段会重叠就合成一行
  const FONT = 11;
  const textWidth = (s: string) =>
    [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? FONT : FONT * 0.6), 0);
  const plannedText = `计划 ${plannedEndLabel}`;
  const predictedText = `预测 ${predictedEndLabel}`;
  const plannedW = textWidth(plannedText);
  const predictedW = textWidth(predictedText);
  const plannedX = X(plannedDay);
  const predictedX = X(predictedDay);
  // 每段文字占的区间 [左, 右]，anchorEnd 为 true 表示右对齐到 x
  const plannedSpan = (() => {
    const left = plannedX - 4 - plannedW;
    return left >= 0
      ? { x: plannedX - 4, end: true, l: left, r: plannedX - 4 }
      : { x: plannedX + 6, end: false, l: plannedX + 6, r: plannedX + 6 + plannedW };
  })();
  const predictedSpan = (() => {
    const right = predictedX + 6 + predictedW;
    return right <= 815
      ? { x: predictedX + 6, end: false, l: predictedX + 6, r: right }
      : { x: predictedX - 4, end: true, l: predictedX - 4 - predictedW, r: predictedX - 4 };
  })();
  const endsGap = FONT;
  const endsOverlap =
    plannedSpan.l < predictedSpan.r + endsGap && predictedSpan.l < plannedSpan.r + endsGap;
  const mergedEndX = Math.min(815, Math.max(plannedX, predictedX) + 4);

  return (
    <svg
      id="burn"
      className="chart"
      viewBox="0 0 815 262"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`燃尽图：${isDelay ? "实际进度落后计划" : "实际进度不落后计划"}，预测 ${predictedEndLabel} 完成，计划 ${plannedEndLabel}`}
    >
      <defs>
        {[
          { id: planMaskId, d: planPath, pts: planPts },
          { id: actMaskId, d: actualPath, pts: actualPts },
          { id: predMaskId, d: predPath, pts: predPts },
        ].map((mask) => (
          <mask
            key={mask.id}
            id={mask.id}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="815"
            height="262"
          >
            <path className="mk" pathLength="1" d={mask.d} style={draw(mask.pts)} />
          </mask>
        ))}
      </defs>

      {/* 水平背景网格线与 Y 轴刻度文字 */}
      {gridValues.map((v) => (
        <g key={`grid-${v}`}>
          <line className="grid" x1={X0} x2={X0 + X_WIDTH} y1={Y(v)} y2={Y(v)} />
          <text className="t m" x="40" y={Y(v) + 4} textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      {/* 主坐标轴线 */}
      <path className="axis" d={`M${X0} ${Y(yMax)} V${Y(0)} H${X0 + X_WIDTH}`} />

      {/* X 轴刻度与日期 */}
      {xLabels.map((lbl) => {
        const x = X(lbl.d);
        return (
          <g key={`x-${lbl.d}`}>
            <line className="axis" x1={x} x2={x} y1={Y(0)} y2={Y(0) + 5} />
            <text className="t m" x={x} y={Y(0) + 20} textAnchor="middle">
              {lbl.text}
            </text>
          </g>
        );
      })}

      {/* 计划线、实际线、预测线 */}
      <path className="plan" d={planPath} mask={`url(#${planMaskId})`} />
      <path className="actual" d={actualPath} mask={`url(#${actMaskId})`} />
      <path
        className={isDelay ? "pred" : "pred ok"}
        d={predPath}
        mask={`url(#${predMaskId})`}
      />

      {/* 今天垂直参考线和文字 */}
      <g className="now-g">
        <line
          className="now"
          x1={X(todayD)}
          x2={X(todayD)}
          y1={Y(yMax) - 4}
          y2={Y(0)}
        />
      </g>
      <text className="t sig" x={X(todayD) + 6} y={Y(yMax) + 2}>
        今天
      </text>

      {/* 今天的实际剩余数：点太靠近顶端时标在点的下面，免得和“今天”叠在一起 */}
      {todayVal !== null && (
        <text
          className="t"
          x={X(todayD) - 6}
          y={Y(todayVal) - 12 < Y(yMax) + 14 ? Y(todayVal) + 20 : Y(todayVal) - 12}
          textAnchor="end"
        >
          {todayVal}
        </text>
      )}

      {/* 计划完工与预测完工垂直标记（时间范围里放得下才画） */}
      {showEnds && (
        <>
          <line
            className="axis"
            x1={X(plannedDay)}
            x2={X(plannedDay)}
            y1={Y(0) - 8}
            y2={Y(0)}
          />
          <line
            className="axis"
            x1={X(plannedDay)}
            x2={X(plannedDay)}
            y1={Y(0)}
            y2={Y(0) + 28}
            style={{ strokeDasharray: "3 3" }}
          />
          <line
            className="pred"
            style={{ strokeDasharray: "none", strokeWidth: 3 }}
            x1={predictedX}
            x2={predictedX}
            y1={Y(0) - 10}
            y2={Y(0) + 28}
          />
          {endsOverlap ? (
            <text className="t" x={mergedEndX} y={Y(0) + 40} textAnchor="end">
              {plannedText}
              <tspan className="sig" dx={endsGap}>
                {predictedText}
              </tspan>
            </text>
          ) : (
            <>
              <text
                className="t"
                x={plannedSpan.x}
                y={Y(0) + 40}
                textAnchor={plannedSpan.end ? "end" : "start"}
              >
                {plannedText}
              </text>
              <text
                className="t sig"
                x={predictedSpan.x}
                y={Y(0) + 40}
                textAnchor={predictedSpan.end ? "end" : "start"}
              >
                {predictedText}
              </text>
            </>
          )}
        </>
      )}
    </svg>
  );
}
