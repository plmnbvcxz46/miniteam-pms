package org.miniteam.pms.task;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.miniteam.pms.system.entity.LogRow;
import org.miniteam.pms.task.entity.Task;

/**
 * 待开始的任务到了计划开始日自动开始：前置任务都完成了就进行中，还有没完成的就阻塞；
 * 前置任务全部完成后，仅对系统自动移入阻塞的任务自动解除阻塞；
 * 前置任务重新打开或新增未完成前置时，仅对尚未实际开工的下游任务重新移入阻塞。
 */
public final class TaskAutoStart {

    public static final String DETAIL_AUTO_DOING = "到了计划开始日，任务自动移到进行中";
    public static final String DETAIL_AUTO_BLOCKED = "到了计划开始日，前置任务还没完成，任务自动移到阻塞";
    public static final String DETAIL_AUTO_UNBLOCKED = "前置任务已全部完成，任务自动移到进行中";
    public static final String DETAIL_AUTO_REBLOCKED = "前置任务未完成，任务自动移到阻塞";

    private TaskAutoStart() {}

    /**
     * 这个待开始任务今天该变成什么状态
     *
     * @param preds 它的全部前置任务
     * @return 进行中或阻塞；不是待开始、没排期或还没到开始日的返回 null
     */
    public static TaskStatus decide(Task task, Collection<Task> preds, LocalDate today) {
        if (!TaskStatus.TODO.name().equals(task.getStatus())
                || task.getPlanStart() == null
                || task.getPlanStart().isAfter(today)) {
            return null;
        }
        return preds.stream().allMatch(ProjectTaskSnapshot::isDone) ? TaskStatus.DOING : TaskStatus.BLOCKED;
    }

    /**
     * 前置任务全部完成时，是否应将阻塞中的任务自动解阻为进行中。
     * 只对系统因前置未完成自动移入阻塞的任务生效，人工手动移入的阻塞保持不变。
     */
    public static TaskStatus decideUnblock(Task task, Collection<Task> preds, boolean autoBlocked) {
        if (!TaskStatus.BLOCKED.name().equals(task.getStatus()) || !autoBlocked) {
            return null;
        }
        return preds.stream().allMatch(ProjectTaskSnapshot::isDone) ? TaskStatus.DOING : null;
    }

    /**
     * 前置任务被重新打开或新增未完成前置时，下游若尚未实际开工且已到计划开始日，则进入阻塞；
     * 已实际开工（人工移入进行中、正常按计划推进中或已完成）的不动。
     */
    public static TaskStatus decideReblock(
            Task task, Collection<Task> preds, LocalDate today, boolean unstartedAutoDoing) {
        if (task.getPlanStart() == null || task.getPlanStart().isAfter(today)) {
            return null;
        }
        boolean hasUnfinishedPred = preds.stream().anyMatch(p -> !ProjectTaskSnapshot.isDone(p));
        if (!hasUnfinishedPred) {
            return null;
        }
        TaskStatus status = TaskStatus.parse(task.getStatus());
        if (status == TaskStatus.TODO) {
            return TaskStatus.BLOCKED;
        }
        if (status == TaskStatus.DOING && (task.getActualStart() == null || unstartedAutoDoing)) {
            return TaskStatus.BLOCKED;
        }
        return null;
    }

    /** 最近一条 STATUS 动态是否为系统自动移入阻塞（userId == null 且文案含“阻塞”）。 */
    public static boolean isAutoBlocked(List<LogRow> taskLogsDesc) {
        LogRow latest = latestStatusLog(taskLogsDesc);
        return latest != null
                && latest.getUserId() == null
                && latest.getDetail() != null
                && latest.getDetail().contains("阻塞");
    }

    /** 最近一条 STATUS 动态是否为系统自动解阻移入进行中（尚未由人工实际开工）。 */
    public static boolean isUnstartedAutoDoing(List<LogRow> taskLogsDesc) {
        LogRow latest = latestStatusLog(taskLogsDesc);
        return latest != null && latest.getUserId() == null && DETAIL_AUTO_UNBLOCKED.equals(latest.getDetail());
    }

    private static LogRow latestStatusLog(List<LogRow> taskLogsDesc) {
        if (taskLogsDesc == null) {
            return null;
        }
        for (LogRow row : taskLogsDesc) {
            if ("STATUS".equals(row.getAction())) {
                return row;
            }
        }
        return null;
    }
}
