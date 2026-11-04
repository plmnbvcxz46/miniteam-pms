package org.miniteam.pms.document.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 DocumentVersion。 */
public record DocumentVersionVO(
        Long id,
        String version,
        String changeNote,
        String fileName,
        long fileSize,
        String contentType,
        UserBriefVO uploader,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt,
        String downloadUrl) {}
