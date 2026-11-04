package org.miniteam.pms.progress;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Objects;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.WorkdayCalendar;
import org.miniteam.pms.task.entity.Task;

/**
 * 预测完工：计划完成日取全部任务截止日的最大值（没有任务时取项目计划结束日）；
 * 延期天数取还没完成的关键路径任务里逾期最多的那个；预测完成日 = 计划完成日 + 延期天数个工作日。
 * 和前端原来的 getForecast 一致。整个项目一个结果，不随看的人的可见范围变。
 */
public record ProgressForecast(LocalDate plannedEnd, LocalDate predictedEnd, int delayDays, Task cause) {

    public static ProgressForecast of(ProjectTaskSnapshot snap, LocalDate projectPlanEnd) {
        LocalDate plannedEnd = snap.tasks.stream()
                .map(Task::getDueDate)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(projectPlanEnd);
        // 逾期天数相同取编号小的
        Task cause = snap.tasks.stream()
                .filter(t -> !ProjectTaskSnapshot.isDone(t) && snap.onCriticalPath(t.getId()))
                .filter(t -> snap.overdueDays(t) > 0)
                .min(Comparator.comparingInt((Task t) -> -snap.overdueDays(t)).thenComparing(Task::getTaskNo))
                .orElse(null);
        int delay = cause == null ? 0 : snap.overdueDays(cause);
        return new ProgressForecast(plannedEnd, WorkdayCalendar.plusWorkdays(plannedEnd, delay), delay, cause);
    }
}
