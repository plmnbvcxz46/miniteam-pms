import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import {
  dateToX,
  dayEnd,
  formatDayLabel,
  type AxisRange,
} from "../../../shared/utils/date";
import type { CpmResult, TimelineForecast } from "../utils";
import type { TimelineScale } from "./TimelineHeader";
import GanttAxis from "./GanttAxis";
import GanttDeps from "./GanttDeps";
import GanttRow from "./GanttRow";

/** 名称列宽（px） */
const NAME_WIDTH = 170;
/** 行高（px） */
const ROW_HEIGHT = 40;
/** 每天最少占的宽度（px），面板更宽时拉伸铺满 */
const MIN_DAY_WIDTH: Record<TimelineScale, number> = { week: 36, month: 16 };

interface GanttPanelProps {
  tasks: TaskDetail[];
  activityMap: Record<number, Activity[]>;
  cpm: CpmResult;
  forecast: TimelineForecast;
  range: AxisRange;
  today: string;
  scale: TimelineScale;
  onOpenTask: (taskId: number) => void;
}

export default function GanttPanel({
  tasks,
  activityMap,
  cpm,
  forecast,
  range,
  today,
  scale,
  onOpenTask,
}: GanttPanelProps) {
  // 面板宽度变化时重新算每天的宽度
  const scrollRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setAvailable(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const days = range.end - range.start;
  const dayWidth = Math.max(
    MIN_DAY_WIDTH[scale],
    (available - NAME_WIDTH) / days,
  );
  const width = Math.floor(dayWidth * days);
  const x = (time: number) => NAME_WIDTH + dateToX(time, range, width);

  const late = forecast.delayDays > 0;

  return (
    <section className="pnl gp">
      <div className="phd">
        <div>
          <span className="k t-kicker">// SCHEDULE</span>
          <h2 className="t-section-title">依赖排期</h2>
        </div>
        <div className="r">
          <div className="legend">
            <span>
              <i className="key on" />
              已进行
            </span>
            <span>
              <i className="key" />
              计划
            </span>
            <span>
              <i className="key done" />
              已完成
            </span>
            <span>
              <i className="key over" />
              阻塞 / 逾期
            </span>
          </div>
          <div className="pred">
            <span>
              预测完成
              <br />
              {late ? `晚 ${forecast.delayDays} 天` : "按时"}
            </span>
            <b className={late ? "" : "ok"}>
              {formatDayLabel(forecast.predictedEnd)}
            </b>
          </div>
        </div>
      </div>

      <div className="scroll-x" ref={scrollRef}>
        <div className="gt" style={{ width: NAME_WIDTH + width }}>
          <div className="gt-head">
            <span className="gt-gut" style={{ width: NAME_WIDTH }} />
            <GanttAxis
              range={range}
              width={width}
              today={today}
              showDays={scale === "week"}
            />
          </div>

          <div
            className="gt-body"
            style={{ "--name": `${NAME_WIDTH}px` } as CSSProperties}
          >
            {tasks.map((task, i) => (
              <GanttRow
                key={task.id}
                task={task}
                activities={activityMap[task.id] ?? []}
                range={range}
                width={width}
                cpm={cpm.rows[task.id]}
                last={i === tasks.length - 1}
                onOpen={onOpenTask}
              />
            ))}

            <GanttDeps
              tasks={tasks}
              cpm={cpm}
              range={range}
              width={width}
              nameWidth={NAME_WIDTH}
              rowHeight={ROW_HEIGHT}
              today={today}
            />

            <div className="gt-line today" style={{ left: x(dayEnd(today)) }}>
              <span className="gt-flag">今天</span>
            </div>
            <div
              className="gt-line plan"
              style={{ left: x(dayEnd(forecast.planEnd)) }}
            >
              <span className="gt-flag left">
                计划 {formatDayLabel(forecast.planEnd)}
              </span>
            </div>
            {late && (
              <div
                className="gt-line pred"
                style={{ left: x(dayEnd(forecast.predictedEnd)) }}
              >
                <span className="gt-flag left late">
                  预测 {formatDayLabel(forecast.predictedEnd)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
