package org.miniteam.pms.task.entity;

import lombok.Data;

/** 对应 task_dependency：前置任务 → 后续任务。 */
@Data
public class TaskDependency {

    private Long id;
    private Long projectId;
    private Long preTaskId;
    private Long nextTaskId;
}
