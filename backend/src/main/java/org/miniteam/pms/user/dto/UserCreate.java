package org.miniteam.pms.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UserCreate(
        @NotBlank @Size(min = 3, max = 32) String username,
        @NotBlank @Size(min = 6, max = 64) String password,
        @NotBlank @Size(max = 32) String realName,
        @Size(max = 64) String dept,
        @NotNull Long roleId,
        @Email @Size(max = 128) String email,
        @Size(max = 20) List<@Size(max = 32) String> skillTags,
        @Min(1) @Max(168) Integer weeklyCapacity) {}
