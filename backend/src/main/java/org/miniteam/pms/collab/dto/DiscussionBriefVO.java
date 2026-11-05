package org.miniteam.pms.collab.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.task.dto.TaskRefVO;

/** 接口里的 DiscussionBrief：讨论列表项，也是任务详情里的讨论简要信息。 */
public record DiscussionBriefVO(
        Long id,
        String title,
        TaskRefVO task,
        int commentCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime lastCommentAt) {}
