package org.miniteam.pms.task;

import java.time.LocalDate;
import java.util.Collection;
import org.miniteam.pms.task.entity.Task;

/**
 * 待开始的任务到了计划开始日自动开始：前置任务都完成了就进行中，还有没完成的就阻塞。
 * 这样到期的任务不会停在“待开始”，开始过的任务也不能再退回待开始。
 */
public final class TaskAutoStart {

    private TaskAutoStart() {}

    /**
     * 这个任务今天该变成什么状态
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
}
