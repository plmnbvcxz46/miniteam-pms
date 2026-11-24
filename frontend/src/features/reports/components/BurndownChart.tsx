import { useId } from "react";
import type { Burndown } from "../../../shared/types/reports";
import {
  BURNDOWN_VIEWBOX,
  buildBurndownModel,
  X0,
  X_WIDTH,
  type BurndownModel,
} from "../burndownModel";
import styles from "./BurndownChart.module.css";

interface BurndownChartProps {
  burndown: Burndown;
}

function BurndownMasks({
  ids,
  model,
}: {
  ids: { plan: string; actual: string; pred: string };
  model: BurndownModel;
}) {
  const masks = [
    { id: ids.plan, d: model.planPath, style: model.planStyle },
    { id: ids.actual, d: model.actualPath, style: model.actualStyle },
    { id: ids.pred, d: model.predPath, style: model.predStyle },
  ];
  return (
    <defs>
      {masks.map((m) => (
        <mask
          key={m.id}
          id={m.id}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="815"
          height="262"
        >
          <path
            fill="none"
            stroke="white"
            strokeWidth={12}
            strokeDasharray="1"
            strokeDashoffset={0}
            pathLength="1"
            d={m.d}
            style={m.style}
          />
        </mask>
      ))}
    </defs>
  );
}

function BurndownAxes({ model }: { model: BurndownModel }) {
  return (
    <>
      {model.gridLines.map((line) => (
        <g key={`grid-${line.value}`}>
          <line
            className={styles.grid}
            x1={X0}
            x2={X0 + X_WIDTH}
            y1={line.y}
            y2={line.y}
          />
          <text
            className={styles.label}
            data-tone="muted"
            x="40"
            y={line.y + 4}
            textAnchor="end"
          >
            {line.value}
          </text>
        </g>
      ))}
      <path
        className={styles.axis}
        d={`M${X0} ${model.yTop} V${model.yZero} H${X0 + X_WIDTH}`}
      />
      {model.xLabels.map((lbl) => (
        <g key={`x-${lbl.d}`}>
          <line
            className={styles.axis}
            x1={lbl.x}
            x2={lbl.x}
            y1={model.yZero}
            y2={model.yZero + 5}
          />
          <text
            className={styles.label}
            data-tone="muted"
            x={lbl.x}
            y={model.yZero + 20}
            textAnchor="middle"
          >
            {lbl.text}
          </text>
        </g>
      ))}
    </>
  );
}

function BurndownEndMarkers({ model }: { model: BurndownModel }) {
  if (!model.showEnds) return null;
  return (
    <>
      <line
        className={styles.axis}
        x1={model.plannedX}
        x2={model.plannedX}
        y1={model.yZero - 8}
        y2={model.yZero}
      />
      <line
        className={styles.planDash}
        x1={model.plannedX}
        x2={model.plannedX}
        y1={model.yZero}
        y2={model.yZero + 28}
      />
      <line
        className={styles.predEnd}
        x1={model.predictedX}
        x2={model.predictedX}
        y1={model.yZero - 10}
        y2={model.yZero + 28}
      />
      {model.endsOverlap ? (
        <text
          className={styles.label}
          x={model.mergedEndX}
          y={model.yZero + 40}
          textAnchor="end"
        >
          {model.plannedText}
          <tspan className={styles.labelAccent} dx={model.endsGap}>
            {model.predictedText}
          </tspan>
        </text>
      ) : (
        <>
          <text
            className={styles.label}
            x={model.plannedSpan.x}
            y={model.yZero + 40}
            textAnchor={model.plannedSpan.end ? "end" : "start"}
          >
            {model.plannedText}
          </text>
          <text
            className={styles.label}
            data-tone="accent"
            x={model.predictedSpan.x}
            y={model.yZero + 40}
            textAnchor={model.predictedSpan.end ? "end" : "start"}
          >
            {model.predictedText}
          </text>
        </>
      )}
    </>
  );
}

export default function BurndownChart({ burndown }: BurndownChartProps) {
  const maskPrefix = useId().replace(/:/g, "_");
  const model = buildBurndownModel(burndown);
  if (!model) return null;

  const maskIds = {
    plan: `${maskPrefix}_plan`,
    actual: `${maskPrefix}_act`,
    pred: `${maskPrefix}_pred`,
  };

  return (
    <div className={styles.chartBox}>
      <svg
        className={styles.chart}
        viewBox={BURNDOWN_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={model.ariaLabel}
      >
        <BurndownMasks ids={maskIds} model={model} />
        <BurndownAxes model={model} />

        <path
          className={styles.plan}
          d={model.planPath}
          mask={`url(#${maskIds.plan})`}
        />
        <path
          className={styles.actual}
          d={model.actualPath}
          mask={`url(#${maskIds.actual})`}
        />
        <path
          className={styles.pred}
          data-ok={model.isDelay ? undefined : "true"}
          d={model.predPath}
          mask={`url(#${maskIds.pred})`}
        />

        <line
          className={styles.now}
          x1={model.todayX}
          x2={model.todayX}
          y1={model.yTop - 4}
          y2={model.yZero}
        />
        <text
          className={styles.label}
          data-tone="accent"
          x={model.todayX + 6}
          y={model.yTop + 2}
        >
          今天
        </text>

        {model.todayVal !== null && (
          <text
            className={styles.label}
            x={model.todayX - 6}
            y={model.todayValY}
            textAnchor="end"
          >
            {model.todayVal}
          </text>
        )}

        <BurndownEndMarkers model={model} />
      </svg>
    </div>
  );
}
