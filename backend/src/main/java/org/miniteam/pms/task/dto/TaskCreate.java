package org.miniteam.pms.task.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** 新建任务。只有标题必填，其余没传的用默认值；milestoneId 前端不用，忽略。 */
public record TaskCreate(
        @NotBlank(message = "任务标题不能为空") @Size(max = 128, message = "任务标题不能超过 128 个字") String title,
        @Size(max = 2000, message = "描述不能超过 2000 个字") String description,
        Long parentId,
        Long assigneeId,
        @Min(value = 1, message = "重要度为 1 到 5") @Max(value = 5, message = "重要度为 1 到 5") Integer importance,
        @Min(value = 1, message = "紧急度为 1 到 5") @Max(value = 5, message = "紧急度为 1 到 5") Integer urgency,
        @Min(value = 1, message = "计划工期至少 1 天") @Max(value = 365, message = "计划工期不能超过 365 天") Integer planDays,
        @DecimalMin(value = "0", message = "预估工时不能为负") @DecimalMax(value = "9999", message = "预估工时过大") Double estHours,
        @Size(max = 20, message = "所需技能最多 20 个")
                List<@Size(max = 32, message = "技能标签不能超过 32 个字") String> requiredSkills,
        LocalDate planStart,
        LocalDate dueDate,
        String status,
        List<Long> predecessorIds) {}
