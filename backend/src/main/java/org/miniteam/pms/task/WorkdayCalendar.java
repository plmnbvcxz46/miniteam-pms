package org.miniteam.pms.task;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/** 工作日的计算：周六日不算，不考虑法定节假日。和前端 pages/board/task/utils.ts 的算法一致。 */
public final class WorkdayCalendar {

    private WorkdayCalendar() {}

    public static boolean isWorkday(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY;
    }

    /** 从开始日算起第 days 个工作日（开始日是工作日时算第 1 个），days 小于 1 按 1 算 */
    public static LocalDate dueDate(LocalDate start, int days) {
        LocalDate current = start;
        int left = Math.max(days, 1);
        for (; ; current = current.plusDays(1)) {
            if (isWorkday(current) && --left <= 0) {
                return current;
            }
        }
    }

    /** date 之后的第 n 个工作日，n 为 0 返回 date 本身 */
    public static LocalDate plusWorkdays(LocalDate date, int n) {
        LocalDate current = date;
        for (int left = n; left > 0; ) {
            current = current.plusDays(1);
            if (isWorkday(current)) {
                left--;
            }
        }
        return current;
    }

    /** 从开始日到今天（含）经过的工作日数 */
    public static int countWorkdays(LocalDate start, LocalDate today) {
        int count = 0;
        for (LocalDate d = start; !d.isAfter(today); d = d.plusDays(1)) {
            if (isWorkday(d)) {
                count++;
            }
        }
        return count;
    }

    /** 已逾期天数（自然日），未完成且超过截止日才算 */
    public static int overdueDays(LocalDate dueDate, LocalDate today, boolean done) {
        if (done || dueDate == null) {
            return 0;
        }
        return (int) Math.max(0, ChronoUnit.DAYS.between(dueDate, today));
    }
}
