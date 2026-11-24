import { useEffect, useRef, useState } from "react";
import { Legend, type LegendItem } from "../../../components/patterns/Legend";
import { Panel } from "../../../components/patterns/Panel";
import type { Activity } from "../../../shared/types/global";
import type { TaskDetail } from "../../../shared/types/task";
import { formatDayLabel, type AxisRange } from "../../../shared/utils/date";
import type { TimelineScale } from "../hooks/useTimelinePage";
import {
  computeGanttFlags,
  type CpmResult,
  type GanttFlag,
  type TimelineForecast,
} from "../utils";
import GanttAxis from "./GanttAxis";
import GanttBody from "./GanttBody";
import { type DepHover } from "./GanttDeps";
import styles from "./GanttPanel.module.css";

const NAME_WIDTH = 170;
const MIN_DAY_WIDTH: Record<TimelineScale, number> = { week: 36, month: 16 };

const GANTT_LEGENDS: readonly LegendItem[] = [
  { key: "inProgress", label: "已进行", swatch: "solid" },
  { key: "planned", label: "计划", swatch: "outline" },
  { key: "done", label: "已完成", swatch: "dashed" },
  { key: "blocked", label: "阻塞 / 逾期", swatch: "striped" },
];

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

function GanttHeaderRight({ forecast }: { forecast: TimelineForecast }) {
  const late = forecast.delayDays > 0;
  return (
    <div className={styles.headerMeta}>
      <Legend items={GANTT_LEGENDS} />
      <div className={styles.pred}>
        <span className={styles.predLabel}>
          预测完成
          <br />
          {late ? `晚 ${forecast.delayDays} 天` : "按时"}
        </span>
        <b className={styles.predDate} data-late={late ? "true" : undefined}>
          {formatDayLabel(forecast.predictedEnd)}
        </b>
      </div>
    </div>
  );
}

function GanttFlagStrip({
  flags,
  inHead = false,
}: {
  flags: GanttFlag[];
  inHead?: boolean;
}) {
  return (
    <div className={styles.flags} data-in-head={inHead ? "true" : undefined}>
      {flags.map((flag) => (
        <span
          key={flag.key}
          className={styles.flag}
          data-late={flag.late ? "true" : undefined}
          style={{ left: flag.left, width: flag.width }}
        >
          {flag.text}
        </span>
      ))}
    </div>
  );
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [hover, setHover] = useState<DepHover>(null);

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
  const flags = computeGanttFlags({
    range,
    width,
    nameWidth: NAME_WIDTH,
    today,
    forecast,
  });

  return (
    <Panel
      variant="flat"
      kicker="// SCHEDULE"
      title="依赖排期"
      className={styles.panel}
      headerRight={<GanttHeaderRight forecast={forecast} />}
    >
      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.chart} style={{ width: NAME_WIDTH + width }}>
          <div className={styles.head}>
            <span className={styles.gutter} style={{ width: NAME_WIDTH }} />
            <GanttAxis
              range={range}
              width={width}
              today={today}
              showDays={scale === "week"}
            />
            {scale !== "week" && <GanttFlagStrip flags={flags} inHead />}
          </div>
          {scale === "week" && <GanttFlagStrip flags={flags} />}

          <GanttBody
            tasks={tasks}
            activityMap={activityMap}
            cpm={cpm}
            forecast={forecast}
            range={range}
            width={width}
            nameWidth={NAME_WIDTH}
            today={today}
            hover={hover}
            onHover={setHover}
            onOpenTask={onOpenTask}
          />
        </div>
      </div>
    </Panel>
  );
}
