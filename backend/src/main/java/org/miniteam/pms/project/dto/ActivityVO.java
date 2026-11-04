package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.system.entity.LogRow;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Activity，项目动态和权限变更记录。 */
public record ActivityVO(
        Long id,
        UserBriefVO user,
        String targetType,
        Long targetId,
        String action,
        String detail,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {

    public static ActivityVO of(LogRow r) {
        return new ActivityVO(
                r.getId(),
                r.getUserId() == null ? null : new UserBriefVO(r.getUserId(), r.getUsername(), r.getRealName()),
                r.getTargetType(),
                r.getTargetId(),
                r.getAction(),
                r.getDetail(),
                r.getCreatedAt());
    }
}
