import type { TaskDetail } from "../../../shared/types/task";
import {
  dateToX,
  dayEnd,
  toDay,
  type AxisRange,
} from "../../../shared/utils/date";
import type { CpmResult } from "../utils";

interface GanttDepsProps {
  tasks: TaskDetail[];
  cpm: CpmResult;
  range: AxisRange;
  /** 横轴总宽度（px） */
  width: number;
  /** 名称列宽度（px） */
  nameWidth: number;
  rowHeight: number;
  today: string;
  /** 鼠标移到或聚焦到的任务：和它直接相连的线突出，其余变浅 */
  hoverId: number | null;
}

/** 依赖线离开前置任务条后先走出的距离（px） */
const ELBOW = 8;

/** 任务条实际画到哪：已完成取完成日，未完成取截止日和今天里更晚的（逾期、阻塞的部分接在截止日后面） */
function barEnd(task: TaskDetail, today: string) {
  if (task.status === "DONE") return dayEnd(task.actualEnd ?? today);
  return Math.max(dayEnd(task.dueDate!), dayEnd(today));
}

/** 前置任务条右端 → 后续任务条左端的折线，两端都在关键路径上画深色加粗，否则画浅色 */
export default function GanttDeps({
  tasks,
  cpm,
  range,
  width,
  nameWidth,
  rowHeight,
  today,
  hoverId,
}: GanttDepsProps) {
  const rowOf = new Map(tasks.map((task, i) => [task.id, i]));
  const y = (id: number) => rowOf.get(id)! * rowHeight + rowHeight / 2;

  const lines = tasks.flatMap((task) =>
    task.predecessors
      .filter((dep) => rowOf.has(dep.task.id))
      .map((dep) => {
        const from = tasks[rowOf.get(dep.task.id)!];
        const x1 = nameWidth + dateToX(barEnd(from, today), range, width);
        const x2 = nameWidth + dateToX(toDay(task.planStart!), range, width);
        const y1 = y(from.id);
        const y2 = y(task.id);
        const crit =
          cpm.rows[from.id].slack === 0 && cpm.rows[task.id].slack === 0;
        // 后续任务开始得比前置任务结束还早（或贴得太近）时，不能直接折过去，
        // 否则线会倒着穿过任务条：改从两行之间的缝里绕过去
        const roomy = x2 >= x1 + ELBOW * 2;
        const mid = (x1 + x2) / 2;
        const gap = y1 + (y2 >= y1 ? rowHeight : -rowHeight) / 2;
        return {
          key: dep.dependencyId,
          crit,
          done: from.status === "DONE" && task.status === "DONE",
          hot: hoverId !== null && (from.id === hoverId || task.id === hoverId),
          path: roomy
            ? `M${x1} ${y1}H${mid}V${y2}H${x2}`
            : `M${x1} ${y1}H${x1 + ELBOW}V${gap}H${x2 - ELBOW}V${y2}H${x2}`,
          head: `${x2},${y2} ${x2 - 5},${y2 - 3} ${x2 - 5},${y2 + 3}`,
        };
      }),
  );

  const draw = (items: typeof lines, cls: string, hot: boolean) => (
    <svg
      className={cls}
      width={nameWidth + width}
      height={tasks.length * rowHeight}
      aria-hidden="true"
    >
      {items.map((line) => (
        <g
          key={line.key}
          className={
            hot
              ? "hot"
              : `${line.crit ? "crit" : ""} ${line.done ? "done" : ""} ${hoverId !== null ? "dim" : ""}`
          }
        >
          <path d={line.path} />
          <polygon className="head" points={line.head} />
        </g>
      ))}
    </svg>
  );

  // 底层画全部线（在任务条下面）；悬停时相连的几条另画在最上层
  return (
    <>
      {draw(
        lines.filter((line) => !line.hot),
        "gt-deps",
        false,
      )}
      {hoverId !== null &&
        draw(
          lines.filter((line) => line.hot),
          "gt-deps top",
          true,
        )}
    </>
  );
}
