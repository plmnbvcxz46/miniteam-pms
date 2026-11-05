package org.miniteam.pms.collab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 发起讨论：标题和第一条评论必填，@ 的文档必须属于所选任务。 */
public record DiscussionCreate(
        @NotBlank(message = "讨论标题不能为空") @Size(max = 128, message = "讨论标题不能超过 128 个字") String title,
        Long taskId,
        @NotBlank(message = "内容不能为空") @Size(max = 2000, message = "内容不能超过 2000 个字") String content,
        List<Long> mentionIds,
        List<Long> documentIds) {}
