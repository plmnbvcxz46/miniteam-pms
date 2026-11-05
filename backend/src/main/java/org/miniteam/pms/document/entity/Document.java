package org.miniteam.pms.document.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

/** 对应 document，查询时带出负责人的基本信息。往期存档会把它直接序列化，不要删字段。 */
@Data
public class Document {

    private Long id;
    private Long projectId;
    private Long taskId;
    private String name;
    private String category;
    private Long ownerId;
    private String ownerUsername;
    private String ownerRealName;
    private String status;
    private String currentVersion;
    private LocalDate dueDate;
    private LocalDateTime finalizedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
