package org.miniteam.pms.project;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.project.dto.IssueSummaryVO;

class IssueCalendarTest {

    private static final LocalDate START = LocalDate.of(2026, 9, 21);

    @Test
    void startDayIsIssueOne() {
        assertEquals(1, IssueCalendar.issueNo(START, START));
        assertEquals(32, IssueCalendar.issueNo(START, LocalDate.of(2026, 10, 22)));
    }

    @Test
    void beforeStartCountsAsFirstIssue() {
        LocalDate date = IssueCalendar.effectiveDate(START, null, LocalDate.of(2026, 9, 1));
        assertEquals(START, date);
        assertEquals(1, IssueCalendar.issueNo(START, date));
    }

    @Test
    void archivedProjectStopsAtEndDate() {
        LocalDate end = LocalDate.of(2026, 10, 1);
        assertEquals(end, IssueCalendar.effectiveDate(START, end, LocalDate.of(2026, 12, 1)));
        assertEquals(LocalDate.of(2026, 9, 25), IssueCalendar.effectiveDate(START, end, LocalDate.of(2026, 9, 25)));
    }

    @Test
    void totalWeeksRoundsUp() {
        assertEquals(1, IssueCalendar.totalWeeks(START, START));
        assertEquals(1, IssueCalendar.totalWeeks(START, START.plusDays(6)));
        assertEquals(2, IssueCalendar.totalWeeks(START, START.plusDays(7)));
        assertEquals(10, IssueCalendar.totalWeeks(START, LocalDate.of(2026, 11, 29)));
    }

    @Test
    void currentWeekStartsAtOneAndKeepsCounting() {
        assertEquals(1, IssueCalendar.currentWeek(START, START));
        assertEquals(1, IssueCalendar.currentWeek(START, START.plusDays(6)));
        assertEquals(2, IssueCalendar.currentWeek(START, START.plusDays(7)));
        assertEquals(12, IssueCalendar.currentWeek(START, START.plusDays(77)));
    }

    @Test
    void issuesAreListedNewestFirst() {
        var list = IssueCalendar.issues(START, START.plusDays(2));
        assertEquals(3, list.size());
        IssueSummaryVO first = list.get(0);
        assertEquals(3, first.issueNo());
        assertEquals(START.plusDays(2), first.issueDate());
        assertEquals(1, list.get(2).issueNo());
        assertEquals(START, list.get(2).issueDate());
        assertFalse(first.risk());
        assertEquals(0, first.delayDays());
    }
}
