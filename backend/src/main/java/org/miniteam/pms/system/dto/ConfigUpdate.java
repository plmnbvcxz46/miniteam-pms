package org.miniteam.pms.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigUpdate(@NotBlank @Size(max = 500) String value) {}
