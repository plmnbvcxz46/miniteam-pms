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
  // 悬停或聚焦的任务，依赖连线据此突出
  const [hoverId, setHoverId] = useState<number | null>(null);

  // 竖线顶端的日期标签：放在表头下面不随行滚走的一条里。默认排在线右侧，
  // 右侧超出图的右边界或压到前一个标签就改排左侧；宽度按等宽字估算（中文一个字宽）
  const totalWidth = NAME_WIDTH + width;
  const flagWidth = (text: string) =>
    [...text].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 10 : 6), 0) + 4;
  const flagDefs = [
    { key: "today", at: x(dayEnd(today)), text: "今天", late: false },
    {
      key: "plan",
      at: x(dayEnd(forecast.planEnd)),
      text: `计划 ${formatDayLabel(forecast.planEnd)}`,
      late: false,
    },
    ...(late
      ? [
          {
            key: "pred",
            at: x(dayEnd(forecast.predictedEnd)),
            text: `预测 ${formatDayLabel(forecast.predictedEnd)}`,
            late: true,
          },
        ]
      : []),
  ].sort((a, b) => a.at - b.at);
  const taken: [number, number][] = [];
  const flags = flagDefs.map((f) => {
    const w = flagWidth(f.text);
    const clash = (l: number, r: number) =>
      taken.some(([tl, tr]) => l < tr && r > tl);
    let left = f.at + 3;
    if (left + w > totalWidth || clash(left, left + w)) {
      left = f.at - 3 - w;
    }
    taken.push([left, left + w]);
    return { ...f, left, w };
  });

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
            {/* 按月没有日号行，标签直接放进那一行 */}
            {scale !== "week" && (
              <div className="gt-flags in-head">
                {flags.map((f) => (
                  <span
                    key={f.key}
                    className={`gt-flag${f.late ? " late" : ""}`}
                    style={{ left: f.left, width: f.w }}
                  >
                    {f.text}
                  </span>
                ))}
              </div>
            )}
          </div>
          {scale === "week" && (
            <div className="gt-flags">
              {flags.map((f) => (
                <span
                  key={f.key}
                  className={`gt-flag${f.late ? " late" : ""}`}
                  style={{ left: f.left, width: f.w }}
                >
                  {f.text}
                </span>
              ))}
            </div>
          )}

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
                onHover={setHoverId}
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
              hoverId={hoverId}
            />

            <div className="gt-line today" style={{ left: x(dayEnd(today)) }} />
            <div
              className="gt-line plan"
              style={{ left: x(dayEnd(forecast.planEnd)) }}
            />
            {late && (
              <div
                className="gt-line pred"
                style={{ left: x(dayEnd(forecast.predictedEnd)) }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
