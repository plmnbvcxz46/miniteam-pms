package org.miniteam.pms.task.dto;

import jakarta.validation.constraints.NotBlank;

public record TaskStatusChange(@NotBlank(message = "状态不能为空") String status) {}
