package org.miniteam.pms.progress.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.Map;

/**
 * 接口里的 IssueSnapshot：某一期的摘要加当天各页面的数据。
 * snapshot 的键：tasks（TaskDetail 数组）、overview、gantt、criticalPath、reports、members、discussions、documents。
 */
public record IssueSnapshotVO(
        int issueNo,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate issueDate,
        String headline,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate predictedEnd,
        int delayDays,
        boolean risk,
        Map<String, Object> snapshot) {}
