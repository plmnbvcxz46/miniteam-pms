package org.miniteam.pms.task.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 接口里的 Board：四列任务，加上“因此受阻”的后续任务。 */
public record BoardVO(Map<String, List<TaskCardVO>> columns, List<BlockedImpact> blockedImpacts) {

    /** 被阻塞的任务（blockedBy）拖累的后续任务 */
    public record BlockedImpact(
            TaskRefVO task, @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate, TaskRefVO blockedBy) {}
}
