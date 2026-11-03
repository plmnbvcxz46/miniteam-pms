import type { TaskDetail } from "../../../../types/task";
import { dateToX, dayEnd, toDay, type AxisRange } from "../../../../utils/date";
import type { CpmResult } from "../../utils";

interface GanttDepsProps {
  tasks: TaskDetail[];
  cpm: CpmResult;
  range: AxisRange;
  /** 横轴总宽度（px） */
  width: number;
  /** 名称列宽度（px） */
  nameWidth: number;
  rowHeight: number;
}

/** 依赖线离开前置任务条后先走出的距离（px） */
const ELBOW = 8;

/** 前置任务条右端 → 后续任务条左端的折线，两端都在关键路径上画实线，否则画虚线 */
export default function GanttDeps({
  tasks,
  cpm,
  range,
  width,
  nameWidth,
  rowHeight,
}: GanttDepsProps) {
  const rowOf = new Map(tasks.map((task, i) => [task.id, i]));
  const y = (id: number) => rowOf.get(id)! * rowHeight + rowHeight / 2;

  const lines = tasks.flatMap((task) =>
    task.predecessors
      .filter((dep) => rowOf.has(dep.task.id))
      .map((dep) => {
        const from = tasks[rowOf.get(dep.task.id)!];
        const x1 = nameWidth + dateToX(dayEnd(from.dueDate!), range, width);
        const x2 = nameWidth + dateToX(toDay(task.planStart!), range, width);
        const y1 = y(from.id);
        const y2 = y(task.id);
        const mid = Math.max(x1 + ELBOW, Math.min(x2 - ELBOW, (x1 + x2) / 2));
        const crit =
          cpm.rows[from.id].slack === 0 && cpm.rows[task.id].slack === 0;
        return {
          key: dep.dependencyId,
          crit,
          path: `M${x1} ${y1}H${mid}V${y2}H${x2}`,
          head: `${x2},${y2} ${x2 - 5},${y2 - 3} ${x2 - 5},${y2 + 3}`,
        };
      }),
  );

  return (
    <svg
      className="gt-deps"
      width={nameWidth + width}
      height={tasks.length * rowHeight}
      aria-hidden="true"
    >
      {lines.map((line) => (
        <g key={line.key}>
          <path className={line.crit ? "" : "free"} d={line.path} />
          <polygon className="head" points={line.head} />
        </g>
      ))}
    </svg>
  );
}
