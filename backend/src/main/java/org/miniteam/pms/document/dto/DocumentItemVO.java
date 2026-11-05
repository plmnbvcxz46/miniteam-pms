package org.miniteam.pms.document.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 DocumentItem。 */
public record DocumentItemVO(
        Long id,
        String name,
        String category,
        TaskRefVO task,
        UserBriefVO owner,
        String status,
        String currentVersion,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        int overdueDays,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime updatedAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime finalizedAt) {}
