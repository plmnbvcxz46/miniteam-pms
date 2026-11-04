package org.miniteam.pms.progress;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.miniteam.pms.progress.dto.CriticalPathVO;
import org.miniteam.pms.progress.dto.GanttVO;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.progress.dto.PriorityItemVO;
import org.miniteam.pms.progress.dto.TodoItemVO;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.task.CriticalPath;
import org.miniteam.pms.task.PriorityCalculator;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.user.dto.UserBriefVO;

/**
 * 甘特图、关键路径面板、总览、今日待办、优先级排名的计算。纯函数，输入是 {@link ProjectData} 和看的人，
 * 实时接口和往期快照共用。关键路径用项目里全部任务算，列表和统计只算看得见的任务。
 */
public final class ProgressCalculator {

    private static final String[] WEEKDAY = {"一", "二", "三", "四", "五", "六", "日"};

    private ProgressCalculator() {}

    // ---------- 公共 ----------

    /** 有排期（计划开始和截止日都有）的任务，按计划开始日、编号排 */
    static List<Task> scheduled(ProjectTaskSnapshot snap) {
        return snap.tasks.stream()
                .filter(t -> t.getPlanStart() != null && t.getDueDate() != null)
                .sorted(Comparator.comparing(Task::getPlanStart).thenComparing(Task::getTaskNo))
                .toList();
    }

    /** 有排期的任务的字母编号 A、B、…、Z、AA…，不随看的人变 */
    static Map<Long, String> labels(ProjectTaskSnapshot snap) {
        Map<Long, String> labels = new HashMap<>();
        List<Task> list = scheduled(snap);
        for (int i = 0; i < list.size(); i++) {
            labels.put(list.get(i).getId(), letters(i));
        }
        return labels;
    }

    static String letters(int index) {
        StringBuilder sb = new StringBuilder();
        for (int n = index + 1; n > 0; n = (n - 1) / 26) {
            sb.insert(0, (char) ('A' + (n - 1) % 26));
        }
        return sb.toString();
    }

    private static List<Task> visibleScheduled(ProjectData d, Viewer v) {
        return scheduled(d.snap()).stream()
                .filter(t -> d.snap().visibleTo(v.canEditTask(), v.userId(), t))
                .toList();
    }

    private static UserBriefVO assignee(Task t) {
        return t.getAssigneeId() == null
                ? null
                : new UserBriefVO(t.getAssigneeId(), t.getAssigneeUsername(), t.getAssigneeRealName());
    }

    private static boolean open(Task t) {
        return !ProjectTaskSnapshot.isDone(t);
    }

    private static LocalDate later(LocalDate a, LocalDate b) {
        return a.isAfter(b) ? a : b;
    }

    private static LocalDate earlier(LocalDate a, LocalDate b) {
        return a.isBefore(b) ? a : b;
    }

    // ---------- 甘特图 ----------

    /** from、to 只用来裁剪返回的任务，为空不裁剪 */
    public static GanttVO gantt(ProjectData d, Viewer v, LocalDate from, LocalDate to) {
        ProjectTaskSnapshot snap = d.snap();
        ProgressForecast forecast = ProgressForecast.of(snap, d.planEnd());
        Map<Long, String> labels = labels(snap);
        List<Task> shown = visibleScheduled(d, v).stream()
                .filter(t -> to == null || !t.getPlanStart().isAfter(to))
                .filter(t -> from == null || !t.getDueDate().isBefore(from))
                .toList();
        List<GanttVO.Task> tasks = shown.stream()
                .map(t -> {
                    CriticalPath.Row row = snap.cpm.rows().get(t.getId());
                    int overdue = snap.overdueDays(t);
                    return new GanttVO.Task(
                            t.getId(),
                            labels.get(t.getId()),
                            t.getTitle(),
                            assignee(t),
                            t.getPlanDays(),
                            t.getPlanStart(),
                            t.getDueDate(),
                            t.getActualStart(),
                            t.getActualEnd(),
                            overdue > 0 ? snap.today : t.getDueDate(),
                            t.getStatus(),
                            row.critical(),
                            row.slack(),
                            overdue);
                })
                .toList();
        Set<Long> ids = new HashSet<>();
        shown.forEach(t -> ids.add(t.getId()));
        List<GanttVO.Dependency> deps = snap.deps.stream()
                .filter(x -> ids.contains(x.getPreTaskId()) && ids.contains(x.getNextTaskId()))
                .map(x -> new GanttVO.Dependency(x.getId(), x.getPreTaskId(), x.getNextTaskId()))
                .toList();
        LocalDate firstStart = shown.stream()
                .map(Task::getPlanStart)
                .min(Comparator.naturalOrder())
                .orElse(snap.today);
        LocalDate lastEnd = shown.stream()
                .map(Task::getDueDate)
                .max(Comparator.naturalOrder())
                .orElse(snap.today);
        return new GanttVO(
                "全部任务",
                from != null ? from : earlier(firstStart, snap.today),
                to != null ? to : later(later(lastEnd, forecast.predictedEnd()), snap.today),
                snap.today,
                tasks,
                deps,
                snap.cpm.total(),
                forecast.plannedEnd(),
                forecast.predictedEnd(),
                forecast.delayDays());
    }

    // ---------- 关键路径 ----------

    public static CriticalPathVO criticalPath(ProjectData d, Viewer v) {
        ProjectTaskSnapshot snap = d.snap();
        ProgressForecast forecast = ProgressForecast.of(snap, d.planEnd());
        Map<Long, String> labels = labels(snap);
        List<Task> shown = byEarliestStart(snap, visibleScheduled(d, v));
        List<CriticalPathVO.Row> rows = new ArrayList<>();
        List<Long> path = new ArrayList<>();
        List<String> pathLabels = new ArrayList<>();
        for (Task t : shown) {
            CriticalPath.Row r = snap.cpm.rows().get(t.getId());
            rows.add(new CriticalPathVO.Row(
                    t.getId(),
                    labels.get(t.getId()),
                    t.getTitle(),
                    t.getPlanDays(),
                    r.es(),
                    r.ef(),
                    r.ls(),
                    r.lf(),
                    r.slack(),
                    r.critical()));
            if (r.critical()) {
                path.add(t.getId());
                pathLabels.add(labels.get(t.getId()));
            }
        }
        return new CriticalPathVO(
                "工作日",
                rows,
                path,
                pathLabels,
                snap.cpm.total(),
                forecast.plannedEnd(),
                forecast.predictedEnd(),
                forecast.delayDays(),
                TaskRefVO.of(forecast.cause()));
    }

    private static List<Task> byEarliestStart(ProjectTaskSnapshot snap, List<Task> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparingInt(
                                (Task t) -> snap.cpm.rows().get(t.getId()).es())
                        .thenComparing(Task::getPlanStart)
                        .thenComparing(Task::getTaskNo))
                .toList();
    }

    // ---------- 待办、优先级排名 ----------

    /** 当前用户负责的未完成任务，按得分从高到低，得分相同先到期的在前 */
    public static List<TodoItemVO> todo(ProjectData d, Viewer v) {
        ProjectTaskSnapshot snap = d.snap();
        return snap.tasks.stream()
                .filter(t -> open(t) && v.userId().equals(t.getAssigneeId()))
                .sorted(byScore(snap))
                .map(t -> new TodoItemVO(
                        TaskRefVO.of(t),
                        t.getDueDate(),
                        snap.priorityOf(t.getId()).score(),
                        dueTag(t.getDueDate(), snap.today, snap.overdueDays(t)),
                        snap.overdueDays(t)))
                .toList();
    }

    public static List<PriorityItemVO> priorityRanking(ProjectData d, Viewer v) {
        ProjectTaskSnapshot snap = d.snap();
        List<Task> ranked = snap.tasks.stream()
                .filter(t -> open(t) && snap.visibleTo(v.canEditTask(), v.userId(), t))
                .sorted(byScore(snap))
                .toList();
        List<PriorityItemVO> items = new ArrayList<>();
        for (int i = 0; i < ranked.size(); i++) {
            Task t = ranked.get(i);
            PriorityCalculator.Priority p = snap.priorityOf(t.getId());
            items.add(new PriorityItemVO(
                    i + 1,
                    TaskRefVO.of(t),
                    assignee(t),
                    p.score(),
                    t.getImportance(),
                    t.getUrgency(),
                    round2(p.timeUrgency()),
                    round2(p.blockImpact()),
                    snap.critical.get(t.getId())));
        }
        return items;
    }

    private static Comparator<Task> byScore(ProjectTaskSnapshot snap) {
        return Comparator.comparingInt((Task t) -> -snap.priorityOf(t.getId()).score())
                .thenComparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Task::getTaskNo);
    }

    private static double round2(double n) {
        return Math.round(n * 100) / 100.0;
    }

    /** 逾期 / 今天 / 周几 / 下周几，更远的写月日 */
    static String dueTag(LocalDate due, LocalDate today, int overdueDays) {
        if (due == null) return "无截止";
        if (overdueDays > 0) return "逾期";
        if (due.equals(today)) return "今天";
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        long weeks = ChronoUnit.WEEKS.between(monday, due.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)));
        String name = "周" + WEEKDAY[due.getDayOfWeek().getValue() - 1];
        if (weeks == 0) return name;
        if (weeks == 1) return "下" + name;
        return due.getMonthValue() + "月" + due.getDayOfMonth() + "日";
    }

    // ---------- 总览 ----------

    public static OverviewVO overview(ProjectData d, Viewer v, int topN) {
        ProjectTaskSnapshot snap = d.snap();
        LocalDate today = snap.today;
        ProgressForecast forecast = ProgressForecast.of(snap, d.planEnd());
        List<Task> visible = snap.visibleTasks(v.canEditTask(), v.userId());
        List<Task> openTasks = visible.stream().filter(ProgressCalculator::open).toList();
        List<Task> overdue =
                openTasks.stream().filter(t -> snap.overdueDays(t) > 0).toList();
        int done = visible.size() - openTasks.size();

        OverviewVO.Stats stats = new OverviewVO.Stats(
                done,
                visible.size(),
                openTasks.size(),
                (int) openTasks.stream()
                        .filter(t -> snap.onCriticalPath(t.getId()))
                        .count(),
                overdue.size(),
                (int) Math.max(0, ChronoUnit.DAYS.between(today, d.planEnd())),
                d.planEnd());

        List<TodoItemVO> todos = todo(d, v);
        return new OverviewVO(
                IssueCalendar.issueNo(d.startDate(), today),
                today,
                stats,
                headline(snap, overdue, forecast),
                schedule(d, visible),
                todos.stream().limit(Math.max(topN, 0)).toList(),
                todos.size(),
                new OverviewVO.Progress(
                        visible.isEmpty() ? 0 : (int) Math.round(done * 100.0 / visible.size()),
                        done,
                        openTasks.size(),
                        visible.size()),
                chain(d, v, forecast));
    }

    /** 逾期任务里先看在关键路径上的，再看逾期最久的 */
    private static OverviewVO.Headline headline(ProjectTaskSnapshot snap, List<Task> overdue, ProgressForecast f) {
        Task top = overdue.stream()
                .min(Comparator.comparing((Task t) -> !snap.onCriticalPath(t.getId()))
                        .thenComparingInt(t -> -snap.overdueDays(t))
                        .thenComparing(Task::getTaskNo))
                .orElse(null);
        if (top == null) {
            return new OverviewVO.Headline(
                    "无逾期任务，进度正常", false, f.delayDays(), f.plannedEnd(), f.predictedEnd(), List.of(), null);
        }
        List<TaskRefVO> blocked = snap.succs.getOrDefault(top.getId(), List.of()).stream()
                .map(snap.byId::get)
                .filter(ProgressCalculator::open)
                .map(TaskRefVO::of)
                .toList();
        String title = top.getTitle() + "逾期 " + snap.overdueDays(top) + " 天，"
                + (blocked.isEmpty() ? "暂未影响后续任务" : blocked.size() + " 项任务因此受阻");
        return new OverviewVO.Headline(
                title, true, f.delayDays(), f.plannedEnd(), f.predictedEnd(), blocked, top.getId());
    }

    /** 本周（周一到周日）每个成员要做的事：未完成、和本周有交集的任务，逾期的画到今天 */
    private static OverviewVO.Schedule schedule(ProjectData d, List<Task> visible) {
        LocalDate today = d.snap().today;
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        List<OverviewVO.Row> rows = new ArrayList<>();
        for (ProjectMember m : d.members()) {
            List<OverviewVO.Bar> bars = visible.stream()
                    .filter(t -> open(t)
                            && m.getUserId().equals(t.getAssigneeId())
                            && t.getPlanStart() != null
                            && t.getDueDate() != null)
                    .map(t -> {
                        LocalDate last = d.snap().overdueDays(t) > 0 ? today : t.getDueDate();
                        LocalDate start = later(t.getPlanStart(), monday);
                        LocalDate end = earlier(later(last, t.getDueDate()), sunday);
                        return new OverviewVO.Bar(t.getId(), t.getTitle(), start, end, t.getStatus());
                    })
                    .filter(b -> !b.end().isBefore(b.start()))
                    .sorted(Comparator.comparing(OverviewVO.Bar::start).thenComparing(OverviewVO.Bar::taskId))
                    .toList();
            rows.add(new OverviewVO.Row(new UserBriefVO(m.getUserId(), m.getUsername(), m.getRealName()), bars));
        }
        return new OverviewVO.Schedule(monday, sunday, rows);
    }

    private static OverviewVO.Path chain(ProjectData d, Viewer v, ProgressForecast f) {
        ProjectTaskSnapshot snap = d.snap();
        Map<Long, String> labels = labels(snap);
        List<OverviewVO.Node> nodes =
                byEarliestStart(
                                snap,
                                visibleScheduled(d, v).stream()
                                        .filter(t -> snap.onCriticalPath(t.getId()))
                                        .toList())
                        .stream()
                        .map(t -> new OverviewVO.Node(
                                t.getId(), labels.get(t.getId()), t.getTitle(), t.getStatus(), snap.overdueDays(t)))
                        .toList();
        return new OverviewVO.Path(nodes, snap.cpm.total(), f.plannedEnd(), f.predictedEnd());
    }
}
