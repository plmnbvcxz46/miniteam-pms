package org.miniteam.pms.collab.entity;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

/** 对应 comment，查询时带出评论人的基本信息。往期存档会把它直接序列化，不要删字段。 */
@Data
public class Comment {

    private Long id;
    private Long discussionId;
    private Long userId;
    private String userUsername;
    private String userRealName;
    private String content;
    /** @ 的用户 ID */
    private List<Long> mentions;
    /** @ 的文档 ID */
    private List<Long> documents;

    private LocalDateTime createdAt;
}
