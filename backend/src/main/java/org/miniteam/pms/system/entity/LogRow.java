package org.miniteam.pms.system.entity;

import java.time.LocalDateTime;
import lombok.Data;

/** operation_log 的一行，连带操作人和所属项目的名称。 */
@Data
public class LogRow {

    private Long id;
    private Long userId;
    private String username;
    private String realName;
    private Long projectId;
    private String projectName;
    private String targetType;
    private Long targetId;
    private String action;
    private String detail;
    private String ip;
    private LocalDateTime createdAt;
}
