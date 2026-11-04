package org.miniteam.pms.task.dto;

import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 DependencyTask：前置或后续任务。 */
public record DependencyTaskVO(Long dependencyId, TaskRefVO task, UserBriefVO assignee, String status) {}
