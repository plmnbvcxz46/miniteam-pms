package org.miniteam.pms.collab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 回复：@ 的文档必须属于讨论所属的任务。 */
public record CommentCreate(
        @NotBlank(message = "内容不能为空") @Size(max = 2000, message = "内容不能超过 2000 个字") String content,
        List<Long> mentionIds,
        List<Long> documentIds) {}
