package org.miniteam.pms.progress.dto;

import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 PriorityItem。 */
public record PriorityItemVO(
        int rank,
        TaskRefVO task,
        UserBriefVO assignee,
        int score,
        int importance,
        int urgency,
        double timeUrgency,
        double blockImpact,
        boolean critical) {}
