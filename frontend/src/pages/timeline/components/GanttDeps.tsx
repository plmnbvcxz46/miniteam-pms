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
  /** 当前悬停的对象：任务（突出它直接相连的线）、某个前置的主干（突出它发出的所有线）、某一条依赖 */
  hover: DepHover;
  onHover: (hover: DepHover) => void;
}

export type DepHover = {
  kind: "task" | "from" | "dep";
  id: number;
} | null;

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
  hover,
  onHover,
}: GanttDepsProps) {
  const rowOf = new Map(tasks.map((task, i) => [task.id, i]));
  // 线都对齐到半像素，1px 的线才不发虚
  const snap = (v: number) => Math.round(v) + 0.5;
  const y = (id: number) => snap(rowOf.get(id)! * rowHeight + rowHeight / 2);

  const lines = tasks.flatMap((task) =>
    task.predecessors
      .filter((dep) => rowOf.has(dep.task.id))
      .map((dep) => {
        const from = tasks[rowOf.get(dep.task.id)!];
        const x1 = snap(nameWidth + dateToX(barEnd(from, today), range, width));
        const x2 = snap(
          nameWidth + dateToX(toDay(task.planStart!), range, width),
        );
        const y1 = y(from.id);
        const y2 = y(task.id);
        const crit =
          cpm.rows[from.id].slack === 0 && cpm.rows[task.id].slack === 0;
        // 同一个前置的所有后继共用这条竖直主干，位置只由前置任务条末端决定
        const trunk = x1 + ELBOW;
        // 后续任务开始得比前置任务结束还早（或贴得太近）时，不能直接折过去，
        // 否则线会倒着穿过任务条：改从两行之间的缝里绕过去
        const roomy = x2 >= trunk + ELBOW;
        const gap = y1 + (y2 >= y1 ? rowHeight : -rowHeight) / 2;
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
          hot:
            hover !== null &&
            ((hover.kind === "task" &&
              (from.id === hover.id || task.id === hover.id)) ||
              (hover.kind === "from" && from.id === hover.id) ||
              (hover.kind === "dep" && dep.dependencyId === hover.id)),
          path: roomy
            ? `M${x1} ${y1}H${trunk}V${y2}H${x2}`
            : `M${x1} ${y1}H${trunk}V${gap}H${x2 - ELBOW}V${y2}H${x2}`,
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
              : `${line.crit ? "crit" : ""} ${line.done ? "done" : ""} ${hover !== null ? "dim" : ""}`
          }
        >
          <path d={line.path} />
          <polygon className="head" points={line.head} />
        </g>
      ))}
    </svg>
  );

  // 命中区域：透明的宽线专门接收鼠标。主干（同一个前置的所有后继共用）按前置分组，
  // 其余水平段按每条依赖各一条；可见的线自己不接收事件
  const trunks = new Map<
    number,
    { x1: number; y1: number; trunk: number; min: number; max: number }
  >();
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
  const hitLayer = (
    <svg
      className="gt-deps hit"
      width={nameWidth + width}
      height={tasks.length * rowHeight}
      aria-hidden="true"
    >
      {[...trunks.entries()].map(([id, t]) => (
        <path
          key={`t${id}`}
          d={`M${t.x1} ${t.y1}H${t.trunk}M${t.trunk} ${t.min}V${t.max}`}
          onMouseEnter={() => onHover({ kind: "from", id })}
          onMouseLeave={() => onHover(null)}
        />
      ))}
      {lines.map((line) => (
        <path
          key={`h${line.key}`}
          d={line.hit}
          onMouseEnter={() => onHover({ kind: "dep", id: line.key })}
          onMouseLeave={() => onHover(null)}
        />
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
      {hitLayer}
      {hover !== null &&
        draw(
          lines.filter((line) => line.hot),
          "gt-deps top",
          true,
        )}
    </>
  );
}
