import { useId } from "react";
import type { Burndown, BurndownRange } from "../../../../types/reports";
import { toMonthDay } from "../../utils";

interface BurndownChartProps {
  burndown: Burndown;
  range: BurndownRange;
}

export default function BurndownChart({ burndown, range }: BurndownChartProps) {
  const maskPrefix = useId().replace(/:/g, "_");

  const isAll = range === "all";

  // 坐标系常数 (viewBox 0 0 815 262)
  const NS = isAll ? 55 : 6;
  const T = 1.1;
  const U2 = T / NS;

  const X = (d: number) => 50 + d * (740 / NS);
  const Y = (v: number) => 214 - v * (196 / 42);

  // 网格横线 (0, 21, 42)
  const gridValues = [0, 21, 42];

  // X 轴刻度标签
  const xLabels = isAll
    ? [
      { d: 0, text: "9.21" },
      { d: 5, text: "9.28" },
      { d: 10, text: "10.5" },
      { d: 15, text: "10.12" },
      { d: 20, text: "10.19" },
      { d: 25, text: "10.26" },
      { d: 30, text: "11.2" },
      { d: 35, text: "11.9" },
      { d: 40, text: "11.16" },
      { d: 45, text: "11.23" },
    ]
    : [
      { d: 0, text: "10.19" },
      { d: 1, text: "10.20" },
      { d: 2, text: "10.21" },
      { d: 3, text: "10.22" },
      { d: 4, text: "10.23" },
      { d: 5, text: "10.24" },
      { d: 6, text: "10.25" },
    ];

  // 计划线
  const planPts: [number, number][] = isAll
    ? [
      [0, 42],
      [50, 0],
    ]
    : [
      [0, 24.4],
      [6, 20.7],
    ];
  const planD0 = 0;
  const planD1 = isAll ? 50 : 6;

  // 今天所在的横轴偏移量 D 与剩余数 V
  const todayD = isAll ? 23 : 3;
  const todayVal = 24;

  // 实际线
  const actualPts: [number, number][] = isAll
    ? [
      [0, 42],
      [5, 39],
      [10, 35],
      [15, 30],
      [20, 26],
      [21, 25],
      [22, 25],
      [23, 24],
    ]
    : [
      [0, 26],
      [1, 25],
      [2, 25],
      [3, 24],
    ];
  const actualD0 = 0;
  const actualD1 = todayD;

  // 预测线
  const predPts: [number, number][] = isAll
    ? [
      [23, 24],
      [52, 0],
    ]
    : [
      [3, 24],
      [6, 22.2],
    ];
  const predD0 = todayD;
  const predD1 = isAll ? 52 : 6;
  const isDelay = isAll;

  // 生成折线 SVG path
  const toPath = (pts: [number, number][]) =>
    "M" + pts.map((p) => `${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(" L");

  const planPath = toPath(planPts);
  const actualPath = toPath(actualPts);
  const predPath = toPath(predPts);

  const planMaskId = `${maskPrefix}_plan`;
  const actMaskId = `${maskPrefix}_act`;
  const predMaskId = `${maskPrefix}_pred`;

  // 计划完工与预测完工标签
  const plannedEndLabel = toMonthDay(burndown.plannedEnd);
  const predictedEndLabel = toMonthDay(burndown.predictedEnd, false);

  return (
    <svg
      id="burn"
      className="chart"
      viewBox="0 0 815 262"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`燃尽图：实际进度落后计划，预测 ${predictedEndLabel} 完成，计划 ${plannedEndLabel}`}
    >
      <defs>
        <mask id={planMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="262">
          <path
            className="mk"
            pathLength="1"
            d={planPath}
            style={
              {
                "--d": `${(planD0 * U2).toFixed(3)}s`,
                "--dur": `${((planD1 - planD0) * U2).toFixed(3)}s`,
              } as React.CSSProperties
            }
          />
        </mask>
        <mask id={actMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="262">
          <path
            className="mk"
            pathLength="1"
            d={actualPath}
            style={
              {
                "--d": `${(actualD0 * U2).toFixed(3)}s`,
                "--dur": `${((actualD1 - actualD0) * U2).toFixed(3)}s`,
              } as React.CSSProperties
            }
          />
        </mask>
        <mask id={predMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="815" height="262">
          <path
            className="mk"
            pathLength="1"
            d={predPath}
            style={
              {
                "--d": `${(predD0 * U2).toFixed(3)}s`,
                "--dur": `${((predD1 - predD0) * U2).toFixed(3)}s`,
              } as React.CSSProperties
            }
          />
        </mask>
      </defs>

      {/* 水平背景网格线与 Y 轴刻度文字 */}
      {gridValues.map((v) => (
        <g key={`grid-${v}`}>
          <line className="grid" x1="50" x2="790" y1={Y(v)} y2={Y(v)} />
          <text className="t m" x="40" y={Y(v) + 4} textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      {/* 主坐标轴线 */}
      <path className="axis" d={`M50 ${Y(42)} V${Y(0)} H790`} />

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

      {/* 计划线 */}
      <path className="plan" d={planPath} mask={`url(#${planMaskId})`} />

      {/* 实际线 */}
      <path className="actual" d={actualPath} mask={`url(#${actMaskId})`} />

      {/* 预测线 */}
      <path
        className={isDelay ? "pred" : "pred ok"}
        d={predPath}
        mask={`url(#${predMaskId})`}
      />

      {/* 今天垂直参考线 */}
      <g className="now-g">
        <line
          className="now"
          x1={X(todayD)}
          x2={X(todayD)}
          y1={Y(42) - 4}
          y2={Y(0)}
        />
      </g>

      {/* 今天指示文字 */}
      <text className="t sig" x={X(todayD) + 6} y={Y(42) + 2}>
        今天
      </text>

      {/* 当前实际剩余数标注 */}
      <text
        className="t"
        x={X(todayD)}
        y={Y(todayVal) - 12}
        textAnchor="middle"
      >
        {todayVal}
      </text>

      {/* 计划完工与预测完工垂直标记 (全周期模式下展示) */}
      {isAll && (
        <>
          {/* 计划 11.27 */}
          <line className="axis" x1={X(50)} x2={X(50)} y1={Y(0) - 8} y2={Y(0)} />
          <line
            className="axis"
            x1={X(50)}
            x2={X(50)}
            y1={Y(0)}
            y2={Y(0) + 28}
            style={{ strokeDasharray: "3 3" }}
          />
          <text className="t" x={X(50) - 4} y={Y(0) + 40} textAnchor="end">
            计划 {plannedEndLabel}
          </text>

          {/* 预测 12.1 */}
          <line
            className="pred"
            style={{ strokeDasharray: "none", strokeWidth: 3 }}
            x1={X(52)}
            x2={X(52)}
            y1={Y(0) - 10}
            y2={Y(0) + 28}
          />
          <text className="t sig" x={X(52) + 6} y={Y(0) + 40}>
            预测 {predictedEndLabel}
          </text>

          {/* 曲线文本标记 */}
          <text className="t m" x={X(9)} y={Y(28)}>
            计划
          </text>
          <text className="t" x={X(13)} y={Y(36) - 6}>
            实际
          </text>
        </>
      )}
    </svg>
  );
}

