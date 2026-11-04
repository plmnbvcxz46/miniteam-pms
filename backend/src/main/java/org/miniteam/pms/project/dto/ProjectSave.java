package org.miniteam.pms.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ProjectSave(
        @NotBlank @Size(max = 64) String name,
        @Size(max = 500) String description,
        @NotNull LocalDate startDate,
        @NotNull LocalDate planEnd) {}
