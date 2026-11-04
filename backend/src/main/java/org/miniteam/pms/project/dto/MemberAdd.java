package org.miniteam.pms.project.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.miniteam.pms.project.ProjectRole;

/** 权限不传就按角色给默认值：项目经理全开，其他人只有编辑文档。 */
public record MemberAdd(
        @NotNull Long userId,
        @Pattern(regexp = ProjectRole.PATTERN) String projectRole,
        @Size(max = 32) String position,
        Boolean canEditTask,
        Boolean canEditSchedule,
        Boolean canEditDoc,
        Boolean canManageMember) {}
