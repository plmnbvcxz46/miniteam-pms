package org.miniteam.pms.system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.system.entity.LogRow;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 LogItem。 */
public record LogItemVO(
        Long id,
        UserBriefVO user,
        ProjectRefVO project,
        String targetType,
        Long targetId,
        String action,
        String detail,
        String ip,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {

    public static LogItemVO of(LogRow r) {
        return new LogItemVO(
                r.getId(),
                r.getUserId() == null ? null : new UserBriefVO(r.getUserId(), r.getUsername(), r.getRealName()),
                r.getProjectId() == null ? null : new ProjectRefVO(r.getProjectId(), r.getProjectName()),
                r.getTargetType(),
                r.getTargetId(),
                r.getAction(),
                r.getDetail(),
                r.getIp(),
                r.getCreatedAt());
    }
}
