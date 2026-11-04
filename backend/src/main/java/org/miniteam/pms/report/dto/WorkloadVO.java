package org.miniteam.pms.report.dto;

import java.util.List;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Workload：成员负载和负载方差。 */
public record WorkloadVO(List<Member> members, double variance) {

    /**
     * loadHours：未完成任务的预估工时之和；weeklyHours 目前和 loadHours 同一口径（本周工时按任务预估工时折算）。
     */
    public record Member(
            UserBriefVO user,
            double loadHours,
            double weeklyHours,
            int capacity,
            int taskCount,
            boolean overCapacity) {}
}
