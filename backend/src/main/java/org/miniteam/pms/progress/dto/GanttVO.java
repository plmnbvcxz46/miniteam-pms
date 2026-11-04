package org.miniteam.pms.progress.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Gantt。 */
public record GanttVO(
        String scope,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate from,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate to,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate today,
        List<Task> tasks,
        List<Dependency> dependencies,
        int totalDuration,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate plannedEnd,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
        int delayDays) {

    /** 接口里的 GanttTask。critical 是总时差为 0（已完成的也算），overrunDays 是已逾期的天数。 */
    public record Task(
            Long taskId,
            String label,
            String title,
            UserBriefVO assignee,
            int planDays,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planStart,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualStart,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualEnd,
            @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
            String status,
            boolean critical,
            int totalFloat,
            int overrunDays) {}

    public record Dependency(Long id, Long preTaskId, Long nextTaskId) {}
}
