package org.miniteam.pms.report;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import org.miniteam.pms.progress.ProgressForecast;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.report.dto.ReportsVO;
import org.miniteam.pms.report.dto.WorkloadVO;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.user.dto.UserBriefVO;

/**
 * 统计报表的计算：概况、燃尽图、每周完成、工期偏差、预测完工、成员负载。纯函数，实时接口和往期快照共用。
 * 数量只算看得见的任务；预测完工是整个项目的。口径和前端原来的 pages/reports/derive.ts 一致。
 */
public final class ReportCalculator {

    static final String UNIT = "项";
    static final String FORECAST_BASIS = "按关键路径上的逾期推算";

    private ReportCalculator() {}

    public static ReportsVO build(ProjectData d, Viewer v) {
        ProjectTaskSnapshot snap = d.snap();
        List<Task> scope = snap.visibleTasks(v.canEditTask(), v.userId());
        ProgressForecast forecast = ProgressForecast.of(snap, d.planEnd());
        ReportsVO.Summary summary = summary(d, scope);
        return new ReportsVO(
                summary,
                burndownAll(d, scope, forecast),
                burndownWeek(d, scope, forecast),
                weeklyCompleted(d, scope),
                durationDeviation(scope),
                forecast(summary, forecast),
                workload(snap, d.members()));
    }

    // ---------- 概况 ----------

    public static ReportsVO.Summary summary(ProjectData d, List<Task> scope) {
        LocalDate today = d.today();
        int totalWeeks = IssueCalendar.totalWeeks(d.startDate(), d.planEnd());
        int week = IssueCalendar.currentWeek(d.startDate(), today);
        List<Task> done = scope.stream().filter(ProjectTaskSnapshot::isDone).toList();
        long onTime = done.stream()
                .filter(t -> t.getActualEnd() != null
                        && t.getDueDate() != null
                        && !t.getActualEnd().isAfter(t.getDueDate()))
                .count();
        return new ReportsVO.Summary(
                today.isBefore(d.startDate()) || week > totalWeeks ? 0 : week,
                totalWeeks,
                scope.size(),
                done.size(),
                scope.size() - done.size(),
                scope.isEmpty() ? 0 : (double) done.size() / scope.size(),
                done.isEmpty() ? 0 : (double) onTime / done.size(),
                done.isEmpty() ? 0 : 1 - (double) onTime / done.size());
    }

    // ---------- 燃尽图 ----------

    /** 某天结束时还没完成的任务数 */
    private static int remainingOn(List<Task> tasks, LocalDate date) {
        return (int) tasks.stream()
                .filter(t -> !(t.getActualEnd() != null && !t.getActualEnd().isAfter(date)))
                .count();
    }

    /** 计划上某天结束时还剩几项：截止日在这天之后的任务数 */
    private static int plannedOn(List<Task> tasks, LocalDate date) {
        return (int) tasks.stream()
                .filter(t -> t.getDueDate() == null || t.getDueDate().isAfter(date))
                .count();
    }

    private static double round1(double n) {
        return Math.round(n * 10) / 10.0;
    }

    static ReportsVO.Burndown burndown(
            List<Task> tasks, List<LocalDate> dates, LocalDate today, ProgressForecast forecast) {
        int remainingToday = remainingOn(tasks, today);
        long daysToFinish = Math.max(1, ChronoUnit.DAYS.between(today, forecast.predictedEnd()));
        TreeSet<LocalDate> all = new TreeSet<>(dates);
        all.add(today);
        List<ReportsVO.BurndownPoint> points = new ArrayList<>();
        for (LocalDate date : all) {
            Double actual = date.isAfter(today) ? null : (double) remainingOn(tasks, date);
            Double predicted = date.isBefore(today)
                    ? null
                    : round1(Math.max(
                            0,
                            remainingToday
                                    * (1 - Math.min(1, (double) ChronoUnit.DAYS.between(today, date) / daysToFinish))));
            points.add(new ReportsVO.BurndownPoint(date, plannedOn(tasks, date), actual, predicted));
        }
        return new ReportsVO.Burndown(UNIT, today, points, forecast.plannedEnd(), forecast.predictedEnd());
    }

    /** 从项目开始日起每 7 天一个点，直到预测完成日，再加上计划、预测完成日 */
    private static ReportsVO.Burndown burndownAll(ProjectData d, List<Task> scope, ProgressForecast forecast) {
        List<LocalDate> dates = new ArrayList<>();
        for (LocalDate date = d.startDate(); !date.isAfter(forecast.predictedEnd()); date = date.plusDays(7)) {
            dates.add(date);
        }
        dates.add(forecast.plannedEnd());
        dates.add(forecast.predictedEnd());
        return burndown(scope, dates, d.today(), forecast);
    }

    /** 今天所在这一周，周一到周日 */
    private static ReportsVO.Burndown burndownWeek(ProjectData d, List<Task> scope, ProgressForecast forecast) {
        LocalDate monday = d.today().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<LocalDate> dates = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            dates.add(monday.plusDays(i));
        }
        return burndown(scope, dates, d.today(), forecast);
    }

    // ---------- 每周完成、工期偏差、预测 ----------

    /** 项目计划的每一周完成了几个任务，周从项目开始日起算 */
    static List<ReportsVO.WeeklyCompleted> weeklyCompleted(ProjectData d, List<Task> scope) {
        int weeks = IssueCalendar.totalWeeks(d.startDate(), d.planEnd());
        LocalDate today = d.today();
        List<ReportsVO.WeeklyCompleted> list = new ArrayList<>();
        for (int i = 0; i < weeks; i++) {
            LocalDate start = d.startDate().plusDays(7L * i);
            LocalDate end = start.plusDays(6);
            int count = (int) scope.stream()
                    .filter(ProjectTaskSnapshot::isDone)
                    .filter(t -> t.getActualEnd() != null
                            && !t.getActualEnd().isBefore(start)
                            && !t.getActualEnd().isAfter(end))
                    .count();
            list.add(new ReportsVO.WeeklyCompleted(start, count, !today.isBefore(start) && !today.isAfter(end)));
        }
        return list;
    }

    /** 最近完成的 5 个任务，实际天数按日历天（含首尾）算，和计划天数的差为正表示超期 */
    static List<ReportsVO.DurationDeviation> durationDeviation(List<Task> scope) {
        return scope.stream()
                .filter(ProjectTaskSnapshot::isDone)
                .filter(t -> t.getActualStart() != null && t.getActualEnd() != null)
                .sorted(Comparator.comparing(Task::getActualEnd).reversed().thenComparing(Task::getTaskNo))
                .limit(5)
                .map(t -> {
                    int actual = (int) ChronoUnit.DAYS.between(t.getActualStart(), t.getActualEnd()) + 1;
                    return new ReportsVO.DurationDeviation(
                            TaskRefVO.of(t), t.getTitle(), t.getPlanDays(), actual, actual - t.getPlanDays());
                })
                .toList();
    }

    static ReportsVO.Forecast forecast(ReportsVO.Summary summary, ProgressForecast f) {
        return new ReportsVO.Forecast(
                f.plannedEnd(),
                f.predictedEnd(),
                f.delayDays(),
                summary.remaining(),
                f.delayDays() > 0,
                FORECAST_BASIS);
    }

    public static ReportsVO.Forecast forecastOf(ProjectData d, Viewer v) {
        ProjectTaskSnapshot snap = d.snap();
        return forecast(
                summary(d, snap.visibleTasks(v.canEditTask(), v.userId())), ProgressForecast.of(snap, d.planEnd()));
    }

    // ---------- 成员负载 ----------

    /** 每个成员未完成任务的预估工时之和；weeklyHours 和 loadHours 同一口径；方差是总体方差，保留两位小数 */
    public static WorkloadVO workload(ProjectTaskSnapshot snap, List<ProjectMember> members) {
        Map<Long, double[]> byUser = new java.util.HashMap<>();
        for (Task t : snap.tasks) {
            if (ProjectTaskSnapshot.isDone(t) || t.getAssigneeId() == null) continue;
            double[] row = byUser.computeIfAbsent(t.getAssigneeId(), k -> new double[2]);
            row[0] += t.getEstHours() == null ? 0 : t.getEstHours();
            row[1] += 1;
        }
        List<WorkloadVO.Member> list = members.stream()
                .map(m -> {
                    double[] row = byUser.getOrDefault(m.getUserId(), new double[2]);
                    int capacity = m.getWeeklyCapacity() == null ? 0 : m.getWeeklyCapacity();
                    return new WorkloadVO.Member(
                            new UserBriefVO(m.getUserId(), m.getUsername(), m.getRealName()),
                            row[0],
                            row[0],
                            capacity,
                            (int) row[1],
                            row[0] > capacity,
                            m.getSkillTags() == null ? List.of() : m.getSkillTags());
                })
                .toList();
        double mean = list.stream()
                .mapToDouble(WorkloadVO.Member::loadHours)
                .average()
                .orElse(0);
        double variance = list.stream()
                .mapToDouble(m -> Math.pow(m.loadHours() - mean, 2))
                .average()
                .orElse(0);
        return new WorkloadVO(list, Math.round(variance * 100) / 100.0);
    }
}
