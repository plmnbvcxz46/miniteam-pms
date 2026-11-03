package org.miniteam.pms.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChange(@NotBlank String oldPassword, @NotBlank @Size(min = 6, max = 64) String newPassword) {}
