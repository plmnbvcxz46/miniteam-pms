package org.miniteam.pms.collab.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.collab.entity.Notification;

/** 接口里的 Notification。 */
public record NotificationVO(
        Long id,
        String type,
        String title,
        String content,
        String link,
        boolean isRead,
        Long projectId,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {

    public static NotificationVO of(Notification n) {
        return new NotificationVO(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getContent(),
                n.getLink(),
                n.isRead(),
                n.getProjectId(),
                n.getCreatedAt());
    }
}
