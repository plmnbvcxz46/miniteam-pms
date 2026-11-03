/**
 * 统计报表：由任务、成员和“今天”算出各个图表的数据。
 * 接口接通后各项对应 GET /projects/{projectId}/reports/*，这里只是替身，
 * 好处是看板、时间线、报表用的是同一批任务，切换期数时一起变
 */
import type { ProjectPeriod } from "../../types/global";
import type { Member } from "../../types/members";
import type {
  Burndown,
  BurndownPoint,
  DurationDeviation,
  Forecast,
  ReportSummary,
  WeeklyCompleted,
  Workload,
} from "../../types/reports";
import type { TaskDetail } from "../../types/task";
import { getWeekProgress } from "../../layouts/utils";
import { addDays, daysBetween, weekStartOf } from "../../utils/date";
import { computeCpm, getForecast, getTimelineTasks } from "../timeline/utils";

export interface ReportData {
  summary: ReportSummary;
  burndownAll: Burndown;
  burndownWeek: Burndown;
  weeklyCompleted: WeeklyCompleted[];
  deviations: DurationDeviation[];
  forecast: Forecast;
  workload: Workload;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** 某天结束时还没完成的任务数 */
function remainingOn(tasks: TaskDetail[], date: string): number {
  return tasks.filter((task) => !(task.actualEnd && task.actualEnd <= date))
    .length;
}

/** 计划上某天结束时还剩几项：截止日在这天之后的任务数 */
function plannedOn(tasks: TaskDetail[], date: string): number {
  return tasks.filter((task) => !task.dueDate || task.dueDate > date).length;
}

function buildBurndown(
  tasks: TaskDetail[],
  dates: string[],
  today: string,
  plannedEnd: string,
  predictedEnd: string,
): Burndown {
  const remainingToday = remainingOn(tasks, today);
  const daysToFinish = Math.max(1, daysBetween(today, predictedEnd));
  const points: BurndownPoint[] = [...new Set([...dates, today])]
    .sort()
    .map((date) => {
      const actual = date <= today ? remainingOn(tasks, date) : null;
      const predicted =
        date < today
          ? null
          : round1(
              Math.max(
                0,
                remainingToday *
                  (1 - Math.min(1, daysBetween(today, date) / daysToFinish)),
              ),
            );
      return { date, planned: plannedOn(tasks, date), actual, predicted };
    });
  return { unit: "项", today, points, plannedEnd, predictedEnd };
}

export function buildReport(
  taskMap: Record<number, TaskDetail>,
  members: Member[],
  period: ProjectPeriod,
  today: string,
): ReportData {
  const tasks = getTimelineTasks(taskMap);
  const forecastBase = getForecast(tasks, computeCpm(tasks));
  const done = tasks.filter((task) => task.status === "DONE");
  const onTime = done.filter(
    (task) => task.actualEnd && task.dueDate && task.actualEnd <= task.dueDate,
  ).length;
  const week = getWeekProgress(period, today);

  const summary: ReportSummary = {
    weekNo: week.current ?? 0,
    totalWeeks: week.total,
    total: tasks.length,
    done: done.length,
    remaining: tasks.length - done.length,
    completionRate: tasks.length ? done.length / tasks.length : 0,
    onTimeRate: done.length ? onTime / done.length : 0,
    delayRate: done.length ? 1 - onTime / done.length : 0,
  };

  const { planEnd, predictedEnd, delayDays } = forecastBase;
  const allDates: string[] = [];
  for (let d = period.startDate; d <= predictedEnd; d = addDays(d, 7)) {
    allDates.push(d);
  }
  allDates.push(planEnd, predictedEnd);
  const weekStart = weekStartOf(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weeklyCompleted: WeeklyCompleted[] = Array.from(
    { length: week.total },
    (_, i) => {
      const start = addDays(period.startDate, i * 7);
      const end = addDays(start, 6);
      return {
        weekStart: start,
        count: done.filter(
          (task) => task.actualEnd && task.actualEnd >= start && task.actualEnd <= end,
        ).length,
        current: today >= start && today <= end,
      };
    },
  );

  const deviations: DurationDeviation[] = done
    .filter((task) => task.actualStart && task.actualEnd)
    .sort((a, b) => b.actualEnd!.localeCompare(a.actualEnd!))
    .slice(0, 5)
    .map((task) => {
      const actualDays = daysBetween(task.actualStart!, task.actualEnd!) + 1;
      return {
        task: { id: task.id, taskNo: task.taskNo, title: task.title },
        label: task.title,
        planDays: task.planDays,
        actualDays,
        deviationDays: actualDays - task.planDays,
      };
    });

  const open = tasks.filter((task) => task.status !== "DONE");
  const rows = members.map((member) => {
    const mine = open.filter((task) => task.assignee?.id === member.user.id);
    return {
      user: member.user,
      loadHours: mine.reduce((sum, task) => sum + task.estHours, 0),
      weeklyHours: member.weeklyHours,
      capacity: member.weeklyCapacity,
      taskCount: mine.length,
      overCapacity: member.weeklyHours > member.weeklyCapacity,
    };
  });
  const mean = rows.length
    ? rows.reduce((sum, row) => sum + row.loadHours, 0) / rows.length
    : 0;
  const variance = rows.length
    ? rows.reduce((sum, row) => sum + (row.loadHours - mean) ** 2, 0) /
      rows.length
    : 0;

  return {
    summary,
    burndownAll: buildBurndown(tasks, allDates, today, planEnd, predictedEnd),
    burndownWeek: buildBurndown(tasks, weekDates, today, planEnd, predictedEnd),
    weeklyCompleted,
    deviations,
    forecast: {
      plannedEnd: planEnd,
      predictedEnd,
      delayDays,
      remaining: summary.remaining,
      risk: delayDays > 0,
      basis: "按关键路径上的逾期推算",
    },
    workload: { members: rows, variance: round1(variance * 100) / 100 },
  };
}
