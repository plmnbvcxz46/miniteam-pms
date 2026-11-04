package org.miniteam.pms.task.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/** 整体替换一个任务的前置任务。 */
public record PredecessorsSet(@NotNull(message = "前置任务不能为空") List<Long> preTaskIds) {}
