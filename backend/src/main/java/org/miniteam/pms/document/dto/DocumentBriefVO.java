package org.miniteam.pms.document.dto;

/** 接口里的 DocumentBrief：任务详情里的文档简要信息。 */
public record DocumentBriefVO(Long id, String name, String currentVersion, String status, int overdueDays) {}
