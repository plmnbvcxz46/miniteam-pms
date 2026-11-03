package org.miniteam.pms.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** status：1 启用 0 停用。 */
public record UserStatusChange(@NotNull @Min(0) @Max(1) Integer status) {}
