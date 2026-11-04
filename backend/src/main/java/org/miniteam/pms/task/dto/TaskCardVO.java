package org.miniteam.pms.task.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 TaskCard。milestoneId 前端已不用，固定为 null。 */
public record TaskCardVO(
        Long id,
        Integer taskNo,
        String title,
        String status,
        UserBriefVO assignee,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        int progress,
        PriorityVO priority,
        boolean critical,
        int overdueDays,
        int sortOrder,
        Long parentId,
        Long milestoneId,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualEnd) {}
