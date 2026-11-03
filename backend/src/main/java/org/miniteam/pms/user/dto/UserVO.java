package org.miniteam.pms.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import org.miniteam.pms.user.entity.SysUser;

/** 接口里的 User（不含密码哈希）。 */
public record UserVO(
        Long id,
        String username,
        String realName,
        String dept,
        Long roleId,
        String roleCode,
        String roleName,
        String email,
        List<String> skillTags,
        Integer weeklyCapacity,
        Integer status,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime lastLoginAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {

    public static UserVO of(SysUser u) {
        return new UserVO(
                u.getId(),
                u.getUsername(),
                u.getRealName(),
                u.getDept(),
                u.getRoleId(),
                u.getRoleCode(),
                u.getRoleName(),
                u.getEmail(),
                u.getSkillTags() == null ? List.of() : u.getSkillTags(),
                u.getWeeklyCapacity(),
                u.getStatus(),
                u.getLastLoginAt(),
                u.getCreatedAt());
    }
}
