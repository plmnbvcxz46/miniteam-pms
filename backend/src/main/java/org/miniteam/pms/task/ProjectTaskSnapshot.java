package org.miniteam.pms.task;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.entity.TaskDependency;

/**
 * 一个项目在某一天的全部任务和依赖，以及据此算出的关键路径、优先级。
 * 不读数据库：实时数据和往期快照里存下来的数据都交给它算，所以任务、进度、报表各处的数字出自同一份代码。
 */
public final class ProjectTaskSnapshot {

    /** 这份数据对应的“今天” */
    public final LocalDate today;

    public final List<Task> tasks;
    public final Map<Long, Task> byId = new HashMap<>();
    public final List<TaskDependency> deps;
    public final Map<Long, List<Long>> preds = new HashMap<>();
    public final Map<Long, List<Long>> succs = new HashMap<>();
    /** 全部任务一起算的关键路径（CPM），已完成的任务也在里面 */
    public final CriticalPath.Result cpm;
    /** 任务卡上的关键路径标记：在关键路径上且还没完成 */
    public final Map<Long, Boolean> critical = new HashMap<>();

    public final Map<Long, PriorityCalculator.Priority> priority;

    public ProjectTaskSnapshot(
            LocalDate today, List<Task> tasks, List<TaskDependency> deps, Map<String, String> configs) {
        this.today = today;
        this.tasks = tasks;
        this.deps = deps;
        tasks.forEach(t -> byId.put(t.getId(), t));
        for (TaskDependency d : deps) {
            if (byId.containsKey(d.getPreTaskId()) && byId.containsKey(d.getNextTaskId())) {
                preds.computeIfAbsent(d.getNextTaskId(), k -> new ArrayList<>()).add(d.getPreTaskId());
                succs.computeIfAbsent(d.getPreTaskId(), k -> new ArrayList<>()).add(d.getNextTaskId());
            }
        }
        this.cpm = CriticalPath.compute(tasks.stream()
                .map(t -> new CriticalPath.Node(t.getId(), t.getPlanDays(), preds.getOrDefault(t.getId(), List.of())))
                .toList());
        tasks.forEach(t -> critical.put(t.getId(), !isDone(t) && onCriticalPath(t.getId())));
        this.priority = PriorityCalculator.calculate(
                tasks.stream()
                        .map(t -> new PriorityCalculator.Input(
                                t.getId(),
                                isDone(t),
                                t.getImportance(),
                                t.getUrgency(),
                                t.getPlanDays(),
                                t.getDueDate(),
                                (int) succs.getOrDefault(t.getId(), List.of()).stream()
                                        .filter(id -> !isDone(byId.get(id)))
                                        .count(),
                                critical.get(t.getId())))
                        .toList(),
                today,
                PriorityCalculator.Config.from(configs));
    }

    /** 总时差为 0，不看有没有完成（甘特图、关键路径面板用） */
    public boolean onCriticalPath(Long taskId) {
        CriticalPath.Row row = cpm.rows().get(taskId);
        return row != null && row.critical();
    }

    public PriorityCalculator.Priority priorityOf(Long taskId) {
        return priority.getOrDefault(taskId, PriorityCalculator.Priority.NONE);
    }

    /** 有“编辑任务”权限的看全部，其他人看自己负责的和关键路径上的 */
    public boolean visibleTo(boolean canEditTask, Long userId, Task task) {
        return canEditTask || critical.get(task.getId()) || userId.equals(task.getAssigneeId());
    }

    public List<Task> visibleTasks(boolean canEditTask, Long userId) {
        return tasks.stream().filter(t -> visibleTo(canEditTask, userId, t)).toList();
    }

    public static boolean isDone(Task t) {
        return TaskStatus.DONE.name().equals(t.getStatus());
    }

    public int overdueDays(Task t) {
        return WorkdayCalendar.overdueDays(t.getDueDate(), today, isDone(t));
    }
}
