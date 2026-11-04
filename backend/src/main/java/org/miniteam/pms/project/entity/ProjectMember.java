package org.miniteam.pms.project.entity;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/** 对应 project_member，查询时带出用户的基本信息和每周可用工时。 */
@Data
public class ProjectMember {

    private Long id;
    private Long projectId;
    private Long userId;
    private String username;
    private String realName;
    private Integer weeklyCapacity;
    private List<String> skillTags;
    private String projectRole;
    private String position;
    private boolean canEditTask;
    private boolean canEditSchedule;
    private boolean canEditDoc;
    private boolean canManageMember;
    private LocalDateTime joinedAt;
}
