package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Project。 */
public record ProjectVO(
        Long id,
        String name,
        String description,
        UserBriefVO owner,
        String status,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planEnd,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate actualEnd,
        int issueNo,
        int totalWeeks,
        int currentWeek,
        String myProjectRole,
        PermissionsVO myPermissions,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {}
