package org.miniteam.pms.document.entity;

import java.time.LocalDateTime;
import lombok.Data;

/** 对应 document_version，查询时带出上传人的基本信息。往期存档会把它直接序列化，不要删字段。 */
@Data
public class DocumentVersion {

    private Long id;
    private Long documentId;
    private String version;
    private String changeNote;
    private String fileName;
    /** 相对存储根目录的路径，不对外返回 */
    private String filePath;

    private Long fileSize;
    private String contentType;
    private Long uploaderId;
    private String uploaderUsername;
    private String uploaderRealName;
    private LocalDateTime createdAt;
}
