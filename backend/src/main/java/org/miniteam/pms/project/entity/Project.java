package org.miniteam.pms.project.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

/** 对应 project，查询时带出项目经理（owner）和当前用户在项目里的角色。 */
@Data
public class Project {

    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerUsername;
    private String ownerRealName;
    private String status;
    private LocalDate startDate;
    private LocalDate planEnd;
    private LocalDate actualEnd;
    private LocalDateTime createdAt;

    /** 当前用户在这个项目里的角色，不是成员为空 */
    private String myRole;
}
