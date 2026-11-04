package org.miniteam.pms.project;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.miniteam.pms.project.dto.IssueSummaryVO;

/**
 * 期号的计算：从项目开始日期起每天一期，开始当天是第 1 期。
 * 还没到开始日期时按第 1 期算，已归档的项目停在结束日期那一期。
 */
public final class IssueCalendar {

    public static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");

    private IssueCalendar() {}

    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    /** 项目当前所在的那一天：夹在开始日期和结束日期（归档时才有）之间 */
    public static LocalDate effectiveDate(LocalDate start, LocalDate end, LocalDate today) {
        LocalDate date = today.isBefore(start) ? start : today;
        return end != null && date.isAfter(end) && !end.isBefore(start) ? end : date;
    }

    /** 某一天是第几期，从 1 开始 */
    public static int issueNo(LocalDate start, LocalDate date) {
        return (int) ChronoUnit.DAYS.between(start, date) + 1;
    }

    /** 计划总共几周，不足一周按一周算 */
    public static int totalWeeks(LocalDate start, LocalDate planEnd) {
        long days = ChronoUnit.DAYS.between(start, planEnd) + 1;
        return (int) Math.max(1, (days + 6) / 7);
    }

    /** 某一天是第几周，从 1 开始，超过计划的周数也照常往后数 */
    public static int currentWeek(LocalDate start, LocalDate date) {
        return (int) (ChronoUnit.DAYS.between(start, date) / 7) + 1;
    }

    /** 从最近一期倒着数到第 1 期。头条、预测完工要等任务模块，先给空值。 */
    public static List<IssueSummaryVO> issues(LocalDate start, LocalDate date) {
        int latest = issueNo(start, date);
        List<IssueSummaryVO> list = new ArrayList<>(latest);
        for (int no = latest; no >= 1; no--) {
            list.add(new IssueSummaryVO(no, start.plusDays(no - 1L), null, null, 0, false));
        }
        return list;
    }
}
