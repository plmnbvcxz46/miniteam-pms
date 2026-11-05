package org.miniteam.pms.collab.entity;

import java.time.LocalDateTime;
import lombok.Data;

/** 对应 discussion，查询时带出发起人和关联任务的基本信息。往期存档会把它直接序列化，不要删字段。 */
@Data
public class Discussion {

    private Long id;
    private Long projectId;
    private Long taskId;
    private String title;
    private Long creatorId;
    private String creatorUsername;
    private String creatorRealName;
    /** 关联任务的编号和标题，没有关联任务（或任务已删除）时为空 */
    private Integer taskNo;

    private String taskTitle;
    private int commentCount;
    private LocalDateTime lastCommentAt;
    private LocalDateTime createdAt;
}
