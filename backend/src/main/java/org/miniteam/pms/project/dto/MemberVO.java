package org.miniteam.pms.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.task.entity.WorkloadRow;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Member（权限字段和其他字段在同一层）。本周工时按未完成任务的预估工时折算，任务数是负责中的未完成任务。 */
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

    public static MemberVO of(ProjectMember m, WorkloadRow load) {
        double hours = load == null ? 0 : load.getLoadHours();
        int capacity = m.getWeeklyCapacity() == null ? 0 : m.getWeeklyCapacity();
        return new MemberVO(
                new UserBriefVO(m.getUserId(), m.getUsername(), m.getRealName()),
                m.getProjectRole(),
                m.getPosition(),
                hours,
                capacity,
                hours > capacity,
                load == null ? 0 : load.getTaskCount(),
                m.getJoinedAt(),
                m.isCanEditTask(),
                m.isCanEditSchedule(),
                m.isCanEditDoc(),
                m.isCanManageMember());
    }
}
