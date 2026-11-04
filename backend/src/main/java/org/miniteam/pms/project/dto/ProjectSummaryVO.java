package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/** 接口里的 ProjectSummary，项目切换浮层用。 */
public record ProjectSummaryVO(
        Long id,
        String name,
        String status,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate planEnd,
        int issueNo,
        String headline,
        String myProjectRole) {}
