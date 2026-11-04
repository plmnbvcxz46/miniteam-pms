package org.miniteam.pms.progress;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.progress.dto.CriticalPathVO;
import org.miniteam.pms.progress.dto.GanttVO;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.entity.TaskDependency;

/** 进度计算：预测完工、字母编号、待办标签、甘特图、关键路径、总览，以及可见范围。 */
public class ProgressCalculatorTest {

    static final LocalDate START = LocalDate.parse("2026-10-19");
    static final LocalDate PLAN_END = LocalDate.parse("2026-11-13");
    /** 周三 */
    static final LocalDate TODAY = LocalDate.parse("2026-11-04");

    static Task task(long id, String status, String start, int days, String due, Long assignee) {
        Task t = new Task();
        t.setId(id);
        t.setTaskNo((int) id);
        t.setTitle("任务" + id);
        t.setStatus(status);
        t.setAssigneeId(assignee);
        t.setAssigneeUsername(assignee == null ? null : "u" + assignee);
        t.setAssigneeRealName(assignee == null ? null : "成员" + assignee);
        t.setImportance(3);
        t.setUrgency(3);
        t.setPlanDays(days);
        t.setEstHours(days * 8.0);
        t.setPlanStart(start == null ? null : LocalDate.parse(start));
        t.setDueDate(due == null ? null : LocalDate.parse(due));
        return t;
    }

    static TaskDependency dep(long id, long pre, long next) {
        TaskDependency d = new TaskDependency();
        d.setId(id);
        d.setPreTaskId(pre);
        d.setNextTaskId(next);
        return d;
    }

    static ProjectMember member(long userId, boolean canEdit) {
        ProjectMember m = new ProjectMember();
        m.setUserId(userId);
        m.setUsername("u" + userId);
        m.setRealName("成员" + userId);
        m.setWeeklyCapacity(40);
        m.setCanEditTask(canEdit);
        return m;
    }

    /**
     * A(已完成) → B(已完成) → C(进行中，逾期 1 天) → D；E 单独一个，时差很大。
     * 关键路径 A→B→C→D，总工期 14 个工作日。
     */
    public static ProjectData data() {
        Task a = task(1, "DONE", "2026-10-19", 5, "2026-10-23", 1L);
        a.setActualStart(LocalDate.parse("2026-10-19"));
        a.setActualEnd(LocalDate.parse("2026-10-22"));
        Task b = task(2, "DONE", "2026-10-26", 5, "2026-10-30", 1L);
        b.setActualStart(LocalDate.parse("2026-10-26"));
        b.setActualEnd(LocalDate.parse("2026-11-02"));
        Task c = task(3, "DOING", "2026-11-02", 2, "2026-11-03", 2L);
        Task d = task(4, "TODO", "2026-11-05", 2, "2026-11-06", 2L);
        Task e = task(5, "TODO", "2026-11-02", 1, "2026-11-02", 3L);
        ProjectTaskSnapshot snap = new ProjectTaskSnapshot(
                TODAY, List.of(a, b, c, d, e), List.of(dep(1, 1, 2), dep(2, 2, 3), dep(3, 3, 4)), Map.of());
        return new ProjectData(START, PLAN_END, snap, List.of(member(1, true), member(2, false), member(3, false)));
    }

    public static final Viewer PM = new Viewer(1L, true);

    @Test
    void forecastPushesPlannedEndByTheMostOverdueCriticalTask() {
        ProgressForecast f = ProgressForecast.of(data().snap(), PLAN_END);
        assertEquals(LocalDate.parse("2026-11-06"), f.plannedEnd());
        assertEquals(1, f.delayDays());
        // 11-06 是周五，往后 1 个工作日是下周一
        assertEquals(LocalDate.parse("2026-11-09"), f.predictedEnd());
        assertEquals(3L, f.cause().getId());
    }

    @Test
    void forecastWithoutTasksFallsBackToProjectEnd() {
        ProjectTaskSnapshot empty = new ProjectTaskSnapshot(TODAY, List.of(), List.of(), Map.of());
        ProgressForecast f = ProgressForecast.of(empty, PLAN_END);
        assertEquals(PLAN_END, f.plannedEnd());
        assertEquals(0, f.delayDays());
        assertNull(f.cause());
    }

    @Test
    void lettersRunPastZ() {
        assertEquals("A", ProgressCalculator.letters(0));
        assertEquals("Z", ProgressCalculator.letters(25));
        assertEquals("AA", ProgressCalculator.letters(26));
        assertEquals("AB", ProgressCalculator.letters(27));
        assertEquals("BA", ProgressCalculator.letters(52));
    }

    @Test
    void labelsFollowPlanStartThenTaskNo() {
        Map<Long, String> labels = ProgressCalculator.labels(data().snap());
        // 开始日：A 10-19，B 10-26，C、E 都是 11-02（编号 3 在前），D 11-05
        assertEquals("A", labels.get(1L));
        assertEquals("B", labels.get(2L));
        assertEquals("C", labels.get(3L));
        assertEquals("D", labels.get(5L));
        assertEquals("E", labels.get(4L));
    }

    @Test
    void dueTags() {
        assertEquals("逾期", ProgressCalculator.dueTag(TODAY.minusDays(1), TODAY, 1));
        assertEquals("今天", ProgressCalculator.dueTag(TODAY, TODAY, 0));
        assertEquals("周五", ProgressCalculator.dueTag(LocalDate.parse("2026-11-06"), TODAY, 0));
        assertEquals("下周二", ProgressCalculator.dueTag(LocalDate.parse("2026-11-10"), TODAY, 0));
        assertEquals("11月24日", ProgressCalculator.dueTag(LocalDate.parse("2026-11-24"), TODAY, 0));
        assertEquals("无截止", ProgressCalculator.dueTag(null, TODAY, 0));
    }

    @Test
    void ganttMarksCriticalTasksAndOverrun() {
        GanttVO g = ProgressCalculator.gantt(data(), PM, null, null);
        assertEquals(5, g.tasks().size());
        assertEquals(14, g.totalDuration());
        assertEquals(LocalDate.parse("2026-11-09"), g.predictedEnd());
        assertEquals(1, g.delayDays());
        GanttVO.Task c =
                g.tasks().stream().filter(t -> t.taskId() == 3L).findFirst().orElseThrow();
        assertTrue(c.critical());
        assertEquals(0, c.totalFloat());
        assertEquals(1, c.overrunDays());
        // 逾期的任务画到今天
        assertEquals(TODAY, c.predictedEnd());
        GanttVO.Task e =
                g.tasks().stream().filter(t -> t.taskId() == 5L).findFirst().orElseThrow();
        assertFalse(e.critical());
        assertEquals(13, e.totalFloat());
        assertEquals(3, g.dependencies().size());
    }

    @Test
    void ganttCanBeClippedByDate() {
        GanttVO g = ProgressCalculator.gantt(data(), PM, LocalDate.parse("2026-11-03"), null);
        // 11-03 之前就结束的 A、B、E 不返回，C（到 11-03）和 D 留着
        assertEquals(
                List.of(3L, 4L), g.tasks().stream().map(GanttVO.Task::taskId).toList());
        // 依赖只留两端都在的
        assertEquals(1, g.dependencies().size());
    }

    @Test
    void criticalPathListsOnlyZeroSlackTasksInOrder() {
        CriticalPathVO cp = ProgressCalculator.criticalPath(data(), PM);
        assertEquals(List.of(1L, 2L, 3L, 4L), cp.path());
        assertEquals(List.of("A", "B", "C", "E"), cp.pathLabels());
        assertEquals(3L, cp.delayCause().id());
        assertEquals(5, cp.rows().size());
    }

    @Test
    void overviewStatsHeadlineAndTodo() {
        OverviewVO o = ProgressCalculator.overview(data(), PM, 5);
        assertEquals(TODAY, o.date());
        assertEquals(17, o.issueNo());
        assertEquals(5, o.stats().total());
        assertEquals(2, o.stats().done());
        assertEquals(3, o.stats().remaining());
        // 未完成的关键任务：C、D
        assertEquals(2, o.stats().criticalRemaining());
        // C 逾期 1 天，E 逾期 2 天
        assertEquals(2, o.stats().overdue());
        assertEquals(9, o.stats().remainingDays());
        assertTrue(o.headline().risk());
        assertEquals(3L, o.headline().targetTaskId());
        assertEquals("任务3逾期 1 天，1 项任务因此受阻", o.headline().title());
        assertEquals(40, o.progress().percent());
        // PM（用户 1）自己没有未完成任务
        assertEquals(0, o.todoTotal());
        assertEquals(3, o.schedule().rows().size());
        assertEquals(LocalDate.parse("2026-11-02"), o.schedule().from());
        assertEquals(LocalDate.parse("2026-11-08"), o.schedule().to());
        // 用户 2 本周的任务条：C（逾期，画到今天）和 D
        assertEquals(2, o.schedule().rows().get(1).bars().size());
    }

    @Test
    void todoOnlyHasMyOpenTasks() {
        List<?> mine = ProgressCalculator.todo(data(), new Viewer(2L, false));
        assertEquals(2, mine.size());
        assertEquals(
                "逾期",
                ProgressCalculator.todo(data(), new Viewer(2L, false)).get(0).dueTag());
    }

    @Test
    void membersWithoutEditPermissionOnlySeeOwnAndCriticalTasks() {
        // 用户 3 只负责 E；E 不在关键路径上，A、B 已完成，C、D 在关键路径上
        GanttVO g = ProgressCalculator.gantt(data(), new Viewer(3L, false), null, null);
        assertEquals(
                List.of(3L, 4L, 5L),
                g.tasks().stream().map(GanttVO.Task::taskId).sorted().toList());
        OverviewVO o = ProgressCalculator.overview(data(), new Viewer(3L, false), 5);
        assertEquals(3, o.stats().total());
    }

    @Test
    void priorityRankingIsSortedAndRanked() {
        var ranking = ProgressCalculator.priorityRanking(data(), PM);
        assertEquals(3, ranking.size());
        for (int i = 0; i < ranking.size(); i++) {
            assertEquals(i + 1, ranking.get(i).rank());
            if (i > 0) {
                assertTrue(ranking.get(i - 1).score() >= ranking.get(i).score());
            }
        }
        assertTrue(ranking.stream().allMatch(r -> r.timeUrgency() >= 0 && r.timeUrgency() <= 1));
    }
}
