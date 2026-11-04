package org.miniteam.pms.progress.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

/** 对应 daily_issue：往期日报。snapshot 是当天结束时的任务、依赖、成员（JSON 文本）。 */
@Data
public class DailyIssue {

    private Long id;
    private Long projectId;
    private LocalDate issueDate;
    private Integer issueNo;
    private String headline;
    private LocalDate predictedEnd;
    private Integer delayDays;
    private String snapshot;
    private LocalDateTime createdAt;
}
