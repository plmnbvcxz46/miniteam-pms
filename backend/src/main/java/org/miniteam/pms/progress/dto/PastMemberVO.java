package org.miniteam.pms.progress.dto;

import java.time.LocalDateTime;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 往期快照里的成员：那一天已经在项目里的人，以及当时的负载。成员页往期据此显示本周工时和负责任务数。 */
public record PastMemberVO(
        UserBriefVO user,
        LocalDateTime joinedAt,
        int weeklyCapacity,
        double weeklyHours,
        int taskCount,
        boolean overCapacity) {}
