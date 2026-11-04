package org.miniteam.pms.project.dto;

import jakarta.validation.constraints.NotNull;

public record PermissionsUpdate(
        @NotNull Boolean canEditTask,
        @NotNull Boolean canEditSchedule,
        @NotNull Boolean canEditDoc,
        @NotNull Boolean canManageMember) {}
