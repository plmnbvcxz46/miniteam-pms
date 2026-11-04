package org.miniteam.pms.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.progress.ProgressCalculatorTest;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.report.dto.ReportsVO;

/** 报表计算：用 ProgressCalculatorTest 里那组 5 个任务，今天是 2026-11-04（周三）。 */
class ReportCalculatorTest {

    final ProjectData data = ProgressCalculatorTest.data();
    final Viewer pm = ProgressCalculatorTest.PM;

    @Test
    void summaryCountsAndRates() {
        ReportsVO.Summary s = ReportCalculator.build(data, pm).summary();
        assertEquals(5, s.total());
        assertEquals(2, s.done());
        assertEquals(3, s.remaining());
        assertEquals(0.4, s.completionRate(), 1e-9);
        // A 按期（完成 10-22 ≤ 截止 10-23），B 晚了（11-02 > 10-30）
        assertEquals(0.5, s.onTimeRate(), 1e-9);
        assertEquals(0.5, s.delayRate(), 1e-9);
        // 10-19 到 11-13 共 26 天，4 周；11-04 在第 3 周
        assertEquals(4, s.totalWeeks());
        assertEquals(3, s.weekNo());
    }

    @Test
    void weeklyCompletedHasOneEntryPerWeek() {
        List<ReportsVO.WeeklyCompleted> weeks = ReportCalculator.build(data, pm).weeklyCompleted();
        assertEquals(4, weeks.size());
        assertEquals(LocalDate.parse("2026-10-19"), weeks.get(0).weekStart());
        // A 在第 1 周完成，B（11-02）在第 3 周完成
        assertEquals(
                List.of(1, 0, 1, 0),
                weeks.stream().map(ReportsVO.WeeklyCompleted::count).toList());
        assertEquals(
                List.of(false, false, true, false),
                weeks.stream().map(ReportsVO.WeeklyCompleted::current).toList());
    }

    @Test
    void durationDeviationUsesCalendarDaysInclusive() {
        List<ReportsVO.DurationDeviation> list =
                ReportCalculator.build(data, pm).deviations();
        assertEquals(2, list.size());
        // 最近完成的在前：B 10-26 到 11-02 共 8 天，计划 5 天
        assertEquals("任务2", list.get(0).label());
        assertEquals(8, list.get(0).actualDays());
        assertEquals(3, list.get(0).deviationDays());
        // A 10-19 到 10-22 共 4 天，计划 5 天，提前 1 天
        assertEquals(-1, list.get(1).deviationDays());
    }

    @Test
    void forecastReportsRiskAndRemaining() {
        ReportsVO.Forecast f = ReportCalculator.build(data, pm).forecast();
        assertEquals(LocalDate.parse("2026-11-06"), f.plannedEnd());
        assertEquals(LocalDate.parse("2026-11-09"), f.predictedEnd());
        assertEquals(1, f.delayDays());
        assertEquals(3, f.remaining());
        assertTrue(f.risk());
    }

    @Test
    void burndownWeekCoversMondayToSunday() {
        ReportsVO.Burndown b = ReportCalculator.build(data, pm).burndownWeek();
        assertEquals("项", b.unit());
        assertEquals(7, b.points().size());
        assertEquals(LocalDate.parse("2026-11-02"), b.points().get(0).date());
        assertEquals(LocalDate.parse("2026-11-08"), b.points().get(6).date());
        // 周一结束时 A、B 都已完成（B 是 11-02），剩 3 项；今天之后没有实际值
        assertEquals(3.0, b.points().get(0).actual());
        assertEquals(3.0, b.points().get(2).actual());
        assertNull(b.points().get(3).actual());
        // 今天之前没有预测值，今天起有
        assertNull(b.points().get(1).predicted());
        assertEquals(3.0, b.points().get(2).predicted());
    }

    @Test
    void burndownPlannedCountsTasksDueAfterTheDate() {
        ReportsVO.Burndown b = ReportCalculator.build(data, pm).burndownAll();
        // 项目开始当天：5 个任务截止日都在之后
        assertEquals(5.0, b.points().get(0).planned());
        // 预测线最后一点（预测完成日）降到 0
        ReportsVO.BurndownPoint last = b.points().get(b.points().size() - 1);
        assertEquals(b.predictedEnd(), last.date());
        assertEquals(0.0, last.predicted());
        assertEquals(0.0, last.planned());
    }

    @Test
    void restrictedViewerOnlyCountsVisibleTasks() {
        ReportsVO r = ReportCalculator.build(data, new Viewer(3L, false));
        assertEquals(3, r.summary().total());
        // 预测完工是整个项目的，不随可见范围变
        assertEquals(LocalDate.parse("2026-11-09"), r.forecast().predictedEnd());
    }

    @Test
    void workloadSumsOpenTaskHoursPerMember() {
        var w = ReportCalculator.build(data, pm).workload();
        assertEquals(3, w.members().size());
        // 用户 2：C 16 小时 + D 16 小时
        assertEquals(32.0, w.members().get(1).loadHours());
        assertEquals(2, w.members().get(1).taskCount());
        // 用户 1 只有已完成的任务
        assertEquals(0.0, w.members().get(0).loadHours());
        assertEquals(8.0, w.members().get(2).loadHours());
        assertTrue(w.variance() > 0);
    }
}
