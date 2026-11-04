package org.miniteam.pms.task.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** 看板拖动：目标列和在目标列里的位置（从 0 起，等于列里任务数表示放到最后）。 */
public record TaskPosition(
        @NotBlank(message = "状态不能为空") String status,
        @NotNull(message = "位置不能为空") @Min(value = 0, message = "位置不能为负") Integer index) {}
