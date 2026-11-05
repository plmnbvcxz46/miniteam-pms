package org.miniteam.pms.collab.entity;

import java.time.LocalDateTime;
import lombok.Data;

/** 对应 notification。 */
@Data
public class Notification {

    private Long id;
    private Long userId;
    private Long projectId;
    private String type;
    private String title;
    private String content;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
}
