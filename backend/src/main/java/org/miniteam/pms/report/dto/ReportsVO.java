package org.miniteam.pms.report.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.task.dto.TaskRefVO;

/** 统计报表各接口的返回值，往期快照里 reports 一次带齐。 */
public record ReportsVO(
        Summary summary,
        Burndown burndownAll,
        Burndown burndownWeek,
        List<WeeklyCompleted> weeklyCompleted,
        List<DurationDeviation> deviations,
        Forecast forecast,
        WorkloadVO workload) {

    /** 接口里的 ReportSummary。 */
    public record Summary(
            int weekNo,
            int totalWeeks,
            int total,
            int done,
            int remaining,
            double completionRate,
            double onTimeRate,
            double delayRate) {}

    public record BurndownPoint(
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date, double planned, Double actual, Double predicted) {}

    public record Burndown(
            String unit,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate today,
            List<BurndownPoint> points,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd) {}

    public record WeeklyCompleted(
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate weekStart, int count, boolean current) {}

    public record DurationDeviation(TaskRefVO task, String label, int planDays, int actualDays, int deviationDays) {}

    public record Forecast(
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
            int delayDays,
            int remaining,
            boolean risk,
            String basis) {}
}
