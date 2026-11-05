package org.miniteam.pms.collab.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 Comment。 */
public record CommentVO(
        Long id,
        UserBriefVO user,
        String content,
        List<UserBriefVO> mentions,
        List<DocumentRefVO> documents,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt) {}
