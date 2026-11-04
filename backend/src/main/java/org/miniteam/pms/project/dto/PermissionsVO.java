package org.miniteam.pms.project.dto;

/** 接口里的 MemberPermissions。 */
public record PermissionsVO(
        boolean canEditTask, boolean canEditSchedule, boolean canEditDoc, boolean canManageMember) {}
