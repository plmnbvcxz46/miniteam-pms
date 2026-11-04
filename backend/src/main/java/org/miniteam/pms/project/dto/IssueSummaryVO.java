package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/** 接口里的 IssueSummary。 */
public record IssueSummaryVO(
        int issueNo,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate issueDate,
        String headline,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
        int delayDays,
        boolean risk) {}
