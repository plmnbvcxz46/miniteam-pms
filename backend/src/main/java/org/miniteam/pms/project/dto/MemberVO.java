package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Member（权限字段和其他字段在同一层）。工时和负责的任务数要等任务模块，先固定为 0。 */
public record MemberVO(
        UserBriefVO user,
        String projectRole,
        String position,
        double weeklyHours,
        int weeklyCapacity,
        boolean overCapacity,
        int taskCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime joinedAt,
        boolean canEditTask,
        boolean canEditSchedule,
        boolean canEditDoc,
        boolean canManageMember) {

    public static MemberVO of(ProjectMember m) {
        return new MemberVO(
                new UserBriefVO(m.getUserId(), m.getUsername(), m.getRealName()),
                m.getProjectRole(),
                m.getPosition(),
                0,
                m.getWeeklyCapacity() == null ? 0 : m.getWeeklyCapacity(),
                false,
                0,
                m.getJoinedAt(),
                m.isCanEditTask(),
                m.isCanEditSchedule(),
                m.isCanEditDoc(),
                m.isCanManageMember());
    }
}
