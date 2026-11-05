package org.miniteam.pms.collab.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 DiscussionDetail：讨论和它的全部评论（旧的在前）。 */
public record DiscussionDetailVO(
        Long id,
        String title,
        UserBriefVO creator,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt,
        Task task,
        List<CommentVO> comments) {

    /** 关联的任务和它此刻的状态、逾期天数 */
    public record Task(Long id, Integer taskNo, String title, String status, int overdueDays) {}
}
