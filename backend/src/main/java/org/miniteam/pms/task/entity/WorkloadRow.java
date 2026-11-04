package org.miniteam.pms.task.entity;

import lombok.Data;

/** 一个成员名下未完成任务的汇总，负载统计用。 */
@Data
public class WorkloadRow {

    private Long userId;
    private Double loadHours;
    private Integer taskCount;
}
