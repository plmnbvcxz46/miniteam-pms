import {
  TaskBar as PatternTaskBar,
  type TaskBarTask,
} from "../../components/patterns/TaskBar";
import type { Activity } from "../types/global";
import type { AxisRange } from "../utils/date";
import { useIssue } from "../../state/issue/useIssue";

interface LegacyTaskBarProps {
  task: TaskBarTask;
  /** 任务的操作记录，用来推算阻塞区间 */
  activities?: Activity[];
  /** 看板里的小条：两端不留白，不画刻度和“截止 / 完成”文字 */
  compact?: boolean;
  /** 和别的任务条共用一条时间轴（时间线页）；不传则按这个任务自己算 */
  range?: AxisRange;
  title?: string;
}

/** 过渡期薄封装：待 BoardPage 与 SchedulePanel 在第 9a/9b 步迁完后移除 */
export default function TaskBar({
  task,
  activities = [],
  compact = false,
  range,
  title,
}: LegacyTaskBarProps) {
  const { today } = useIssue();

  return (
    <PatternTaskBar
      task={task}
      today={today}
      activities={activities}
      variant={compact ? "compact" : "full"}
      range={range}
      title={title}
    />
  );
}
