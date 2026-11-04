package org.miniteam.pms.task.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/** 对应 task，查询时带出负责人和创建人的基本信息。 */
@Data
public class Task {

    private Long id;
    private Long projectId;
    private Integer taskNo;
    private Long milestoneId;
    private Long parentId;
    private String title;
    private String description;
    private String status;
    private Long assigneeId;
    private String assigneeUsername;
    private String assigneeRealName;
    private Long creatorId;
    private String creatorUsername;
    private String creatorRealName;
    private Integer importance;
    private Integer urgency;
    private Integer planDays;
    private Double estHours;
    private List<String> requiredSkills;
    private Integer progress;
    private LocalDate planStart;
    private LocalDate dueDate;
    private LocalDate actualStart;
    private LocalDate actualEnd;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
