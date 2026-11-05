package org.miniteam.pms.document.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 接口里的 DocumentDetail：DocumentItem 的字段加版本记录（新的在前）。 */
public record DocumentDetailVO(
        Long id,
        String name,
        String category,
        TaskRefVO task,
        UserBriefVO owner,
        String status,
        String currentVersion,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate dueDate,
        int overdueDays,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime updatedAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime finalizedAt,
        List<DocumentVersionVO> versions) {

    public static DocumentDetailVO of(DocumentItemVO item, List<DocumentVersionVO> versions) {
        return new DocumentDetailVO(
                item.id(),
                item.name(),
                item.category(),
                item.task(),
                item.owner(),
                item.status(),
                item.currentVersion(),
                item.dueDate(),
                item.overdueDays(),
                item.createdAt(),
                item.updatedAt(),
                item.finalizedAt(),
                versions);
    }
}
