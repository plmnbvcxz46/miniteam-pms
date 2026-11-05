package org.miniteam.pms.document.dto;

import jakarta.validation.constraints.NotBlank;

public record DocumentStatusChange(@NotBlank(message = "状态不能为空") String status) {}
