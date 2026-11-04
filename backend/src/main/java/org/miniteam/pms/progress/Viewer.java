package org.miniteam.pms.progress;

/** 谁在看：决定能看到哪些任务（有“编辑任务”权限的看全部，其他人看自己的和关键路径上的）。 */
public record Viewer(Long userId, boolean canEditTask) {}
