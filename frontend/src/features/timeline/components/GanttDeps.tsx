import type { TaskDetail } from "../../../shared/types/task";
import {
  dateToX,
  dayEnd,
  toDay,
  type AxisRange,
} from "../../../shared/utils/date";
import type { CpmResult } from "../utils";
import styles from "./GanttDeps.module.css";

export type DepHover = {
  kind: "task" | "from" | "dep";
  id: number;
} | null;

const ELBOW = 8;

interface DepLine {
  key: number;
  crit: boolean;
  done: boolean;
  fromId: number;
  x1: number;
  y1: number;
  trunk: number;
  yEnd: number;
  hit: string;
  hot: boolean;
  path: string;
  head: string;
}

interface TrunkSegment {
  x1: number;
  y1: number;
  trunk: number;
  min: number;
  max: number;
}

function barEnd(task: TaskDetail, today: string) {
  if (task.status === "DONE") return dayEnd(task.actualEnd ?? today);
  return Math.max(dayEnd(task.dueDate!), dayEnd(today));
}

function buildDepLines({
  tasks,
  cpm,
  range,
  width,
  nameWidth,
  rowHeight,
  today,
  hover,
}: {
  tasks: TaskDetail[];
  cpm: CpmResult;
  range: AxisRange;
  width: number;
  nameWidth: number;
  rowHeight: number;
  today: string;
  hover: DepHover;
}): DepLine[] {
  const rowOf = new Map(tasks.map((task, i) => [task.id, i]));
  const snap = (v: number) => Math.round(v) + 0.5;
  const yOf = (id: number) => snap(rowOf.get(id)! * rowHeight + rowHeight / 2);

  return tasks.flatMap((task) =>
    task.predecessors
      .filter((dep) => rowOf.has(dep.task.id))
      .map((dep) => {
        const from = tasks[rowOf.get(dep.task.id)!];
        const x1 = snap(nameWidth + dateToX(barEnd(from, today), range, width));
        const x2 = snap(
          nameWidth + dateToX(toDay(task.planStart!), range, width),
        );
        const y1 = yOf(from.id);
        const y2 = yOf(task.id);
        const trunk = x1 + ELBOW;
        const roomy = x2 >= trunk + ELBOW;
        const gap = y1 + (y2 >= y1 ? rowHeight : -rowHeight) / 2;
        const crit =
          cpm.rows[from.id].slack === 0 && cpm.rows[task.id].slack === 0;
        const hot =
          hover !== null &&
          ((hover.kind === "task" &&
            (from.id === hover.id || task.id === hover.id)) ||
            (hover.kind === "from" && from.id === hover.id) ||
            (hover.kind === "dep" && dep.dependencyId === hover.id));

        return {
          key: dep.dependencyId,
          crit,
          done: from.status === "DONE" && task.status === "DONE",
          fromId: from.id,
          x1,
          y1,
          trunk,
          yEnd: roomy ? y2 : gap,
          hit: roomy
            ? `M${trunk} ${y2}H${x2}`
            : `M${trunk} ${gap}H${x2 - ELBOW}V${y2}H${x2}`,
          hot,
          path: roomy
            ? `M${x1} ${y1}H${trunk}V${y2}H${x2}`
            : `M${x1} ${y1}H${trunk}V${gap}H${x2 - ELBOW}V${y2}H${x2}`,
          head: `${x2},${y2} ${x2 - 5},${y2 - 3} ${x2 - 5},${y2 + 3}`,
        };
      }),
  );
}

function buildDepTrunks(lines: DepLine[]): Map<number, TrunkSegment> {
  const trunks = new Map<number, TrunkSegment>();
  for (const line of lines) {
    const t = trunks.get(line.fromId);
    if (t) {
      t.min = Math.min(t.min, line.yEnd);
      t.max = Math.max(t.max, line.yEnd);
    } else {
      trunks.set(line.fromId, {
        x1: line.x1,
        y1: line.y1,
        trunk: line.trunk,
        min: Math.min(line.y1, line.yEnd),
        max: Math.max(line.y1, line.yEnd),
      });
    }
  }
  return trunks;
}

function DepLineLayer({
  items,
  svgWidth,
  svgHeight,
  hot,
  dimAll,
}: {
  items: DepLine[];
  svgWidth: number;
  svgHeight: number;
  hot: boolean;
  dimAll: boolean;
}) {
  return (
    <svg
      className={hot ? `${styles.svg} ${styles.top}` : styles.svg}
      width={svgWidth}
      height={svgHeight}
      aria-hidden="true"
    >
      {items.map((line) => (
        <g
          key={line.key}
          className={styles.group}
          data-hot={hot ? "true" : undefined}
          data-critical={!hot && line.crit ? "true" : undefined}
          data-done={!hot && line.done ? "true" : undefined}
          data-dim={!hot && dimAll ? "true" : undefined}
        >
          <path d={line.path} />
          <polygon className={styles.head} points={line.head} />
        </g>
      ))}
    </svg>
  );
}

export interface GanttDepsProps {
  tasks: TaskDetail[];
  cpm: CpmResult;
  range: AxisRange;
  width: number;
  nameWidth: number;
  rowHeight: number;
  today: string;
  hover: DepHover;
  onHover: (hover: DepHover) => void;
  layer?: "under" | "over";
}

export default function GanttDeps({
  tasks,
  cpm,
  range,
  width,
  nameWidth,
  rowHeight,
  today,
  hover,
  onHover,
  layer = "under",
}: GanttDepsProps) {
  const lines = buildDepLines({
    tasks,
    cpm,
    range,
    width,
    nameWidth,
    rowHeight,
    today,
    hover,
  });
  const svgWidth = nameWidth + width;
  const svgHeight = tasks.length * rowHeight;

  if (layer === "over") {
    if (hover === null) return null;
    return (
      <DepLineLayer
        items={lines.filter((l) => l.hot)}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        hot
        dimAll={false}
      />
    );
  }

  const trunks = buildDepTrunks(lines);
  return (
    <>
      <DepLineLayer
        items={lines.filter((l) => !l.hot)}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        hot={false}
        dimAll={hover !== null}
      />
      <svg
        className={`${styles.svg} ${styles.hit}`}
        width={svgWidth}
        height={svgHeight}
        aria-hidden="true"
      >
        {[...trunks.entries()].map(([id, t]) => (
          <path
            key={`t${id}`}
            strokeWidth={8}
            d={`M${t.x1} ${t.y1}H${t.trunk}M${t.trunk} ${t.min}V${t.max}`}
            onMouseEnter={() => onHover({ kind: "from", id })}
            onMouseLeave={() => onHover(null)}
          />
        ))}
        {lines.map((line) => (
          <path
            key={`h${line.key}`}
            strokeWidth={8}
            d={line.hit}
            onMouseEnter={() => onHover({ kind: "dep", id: line.key })}
            onMouseLeave={() => onHover(null)}
          />
        ))}
      </svg>
    </>
  );
}
