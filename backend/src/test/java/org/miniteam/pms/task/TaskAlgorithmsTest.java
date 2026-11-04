package org.miniteam.pms.task;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.task.CriticalPath.Node;
import org.miniteam.pms.task.PriorityCalculator.Config;
import org.miniteam.pms.task.PriorityCalculator.Input;

class TaskAlgorithmsTest {

    // 2026-10-19 是周一
    private static final LocalDate MON = LocalDate.of(2026, 10, 19);

    @Test
    void dueDateSkipsWeekend() {
        assertEquals(MON, WorkdayCalendar.dueDate(MON, 1));
        assertEquals(LocalDate.of(2026, 10, 23), WorkdayCalendar.dueDate(MON, 5));
        // 周一开始做 6 个工作日，跳过周末到下周一
        assertEquals(LocalDate.of(2026, 10, 26), WorkdayCalendar.dueDate(MON, 6));
        // 周六开始，第 1 个工作日是下周一
        assertEquals(LocalDate.of(2026, 10, 26), WorkdayCalendar.dueDate(LocalDate.of(2026, 10, 24), 1));
    }

    @Test
    void workdayCounting() {
        assertEquals(5, WorkdayCalendar.countWorkdays(MON, LocalDate.of(2026, 10, 25)));
        assertEquals(1, WorkdayCalendar.countWorkdays(MON, MON));
        assertEquals(LocalDate.of(2026, 10, 26), WorkdayCalendar.plusWorkdays(LocalDate.of(2026, 10, 23), 1));
        assertEquals(3, WorkdayCalendar.overdueDays(MON, MON.plusDays(3), false));
        assertEquals(0, WorkdayCalendar.overdueDays(MON, MON.plusDays(3), true));
        assertEquals(0, WorkdayCalendar.overdueDays(MON, MON.minusDays(1), false));
    }

    @Test
    void criticalPathFindsLongestChain() {
        // 1(3) -> 2(2) -> 4(1) 总工期 6；3(1) -> 4 有 4 天富余
        CriticalPath.Result r = CriticalPath.compute(List.of(
                new Node(1, 3, List.of()),
                new Node(2, 2, List.of(1L)),
                new Node(3, 1, List.of()),
                new Node(4, 1, List.of(2L, 3L))));
        assertEquals(6, r.total());
        assertTrue(r.rows().get(1L).critical());
        assertTrue(r.rows().get(2L).critical());
        assertTrue(r.rows().get(4L).critical());
        assertFalse(r.rows().get(3L).critical());
        assertEquals(4, r.rows().get(3L).slack());
        assertEquals(3, r.rows().get(2L).es());
        assertEquals(5, r.rows().get(2L).lf());
    }

    @Test
    void criticalPathIgnoresUnknownPredecessorsAndCycles() {
        CriticalPath.Result r = CriticalPath.compute(List.of(new Node(1, 2, List.of(99L))));
        assertEquals(2, r.total());
        assertTrue(r.rows().get(1L).critical());
        // 成环不能死循环
        CriticalPath.compute(List.of(new Node(1, 1, List.of(2L)), new Node(2, 1, List.of(1L))));
    }

    @Test
    void graphReaches() {
        Map<Long, List<Long>> next = Map.of(1L, List.of(2L), 2L, List.of(3L));
        assertTrue(DependencyGraph.reaches(next, 1, 3));
        assertTrue(DependencyGraph.reaches(next, 2, 2));
        assertFalse(DependencyGraph.reaches(next, 3, 1));
    }

    @Test
    void priorityScore() {
        LocalDate today = MON;
        // 任务 1：重要度 5 紧急度 5，明天截止、工期 2 天（u=1），后续 1 个、在关键路径（b=1）→ 满分
        // 任务 2：重要度 1 紧急度 1，没有截止日，没有后续 → 0
        // 任务 3 已完成不参与
        Map<Long, PriorityCalculator.Priority> r = PriorityCalculator.calculate(
                List.of(
                        new Input(1, false, 5, 5, 2, today.plusDays(1), 1, true),
                        new Input(2, false, 1, 1, 1, null, 0, false),
                        new Input(3, true, 3, 3, 1, today, 0, false)),
                today,
                Config.DEFAULT);
        assertEquals(100, r.get(1L).score());
        assertEquals("高", r.get(1L).label());
        assertEquals(0, r.get(2L).score());
        assertEquals("低", r.get(2L).label());
        assertFalse(r.containsKey(3L));
    }

    @Test
    void priorityMiddle() {
        // 重要度 3 紧急度 3 → 各 0.5；u: 工期 2 / 剩余 4 = 0.5；b = 0。
        // (0.3*0.5 + 0.3*0.5 + 0.25*0.5 + 0) / 1.0 = 0.425 → 43（四舍五入）
        Map<Long, PriorityCalculator.Priority> r = PriorityCalculator.calculate(
                List.of(new Input(1, false, 3, 3, 2, MON.plusDays(4), 0, false)), MON, Config.DEFAULT);
        assertEquals(43, r.get(1L).score());
        assertEquals("中", r.get(1L).label());
    }

    @Test
    void configFallsBack() {
        Config c = Config.from(Map.of("priority.weight.time", "0.4", "priority.alpha", "abc"));
        assertEquals(0.4, c.time());
        assertEquals(0.5, c.alpha());
        assertEquals(0.3, c.importance());
    }
}
