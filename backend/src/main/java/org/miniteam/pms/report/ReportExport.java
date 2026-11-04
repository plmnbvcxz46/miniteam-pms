package org.miniteam.pms.report;

import java.util.ArrayList;
import java.util.List;
import org.miniteam.pms.report.dto.ReportsVO;

/** 报表导出的那张表：概况、成员工时、每周完成、工期偏差，排版和前端原来的 buildReportRows 一致。 */
public final class ReportExport {

    public static final String SHEET_NAME = "统计报表";
    public static final int[] WIDTHS = {18, 12, 12, 12, 12};

    private ReportExport() {}

    private static String pad2(int n) {
        return n < 10 ? "0" + n : String.valueOf(n);
    }

    private static String percent(double rate) {
        return Math.round(rate * 100) + "%";
    }

    private static List<Object> row(Object... cells) {
        return List.of(cells);
    }

    public static List<List<Object>> rows(ReportsVO r) {
        ReportsVO.Summary s = r.summary();
        List<List<Object>> rows = new ArrayList<>();
        rows.add(row("概况"));
        rows.add(row("当前周", pad2(s.weekNo()) + "/" + pad2(s.totalWeeks())));
        rows.add(row("任务总数", s.total()));
        rows.add(row("已完成", s.done()));
        rows.add(row("剩余", s.remaining()));
        rows.add(row("完成率", percent(s.completionRate())));
        rows.add(row("按期率", percent(s.onTimeRate())));
        rows.add(row("延期率", percent(s.delayRate())));
        rows.add(row());
        rows.add(row("成员", "本周工时", "未完成工时", "每周上限", "负责任务数"));
        r.workload()
                .members()
                .forEach(m -> rows.add(
                        row(m.user().realName(), m.weeklyHours(), m.loadHours(), m.capacity(), m.taskCount())));
        rows.add(row());
        rows.add(row("周起始", "完成任务数"));
        r.weeklyCompleted().forEach(w -> rows.add(row(w.weekStart().toString(), w.count())));
        rows.add(row());
        rows.add(row("任务", "计划天数", "实际天数", "偏差天数"));
        r.deviations().forEach(x -> rows.add(row(x.label(), x.planDays(), x.actualDays(), x.deviationDays())));
        return rows;
    }

    public static byte[] build(ReportsVO r) {
        return XlsxWriter.build(SHEET_NAME, rows(r), WIDTHS);
    }
}
