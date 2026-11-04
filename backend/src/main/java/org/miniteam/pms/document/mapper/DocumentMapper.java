package org.miniteam.pms.document.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.document.entity.Document;
import org.miniteam.pms.document.entity.DocumentVersion;

@Mapper
public interface DocumentMapper {

    Document findById(@Param("id") Long id);

    /** 锁住文档行，串行化同一份文档的传新版本和定稿 */
    Long lock(@Param("id") Long id);

    /** 项目里的全部文档，新建的在前 */
    List<Document> listByProject(@Param("projectId") Long projectId);

    /** 任务上第一份没定稿的文档，没有返回 null */
    Document firstUnfinalByTask(@Param("taskId") Long taskId);

    void insert(Document document);

    /** 传了新版本之后更新当前版本号 */
    void updateCurrentVersion(@Param("id") Long id, @Param("currentVersion") String currentVersion);

    void finalizeDocument(@Param("id") Long id);

    DocumentVersion findVersion(@Param("id") Long id);

    /** 某份文档的全部版本，新的在前 */
    List<DocumentVersion> listVersions(@Param("documentId") Long documentId);

    /** 项目里全部文档的全部版本，往期存档用 */
    List<DocumentVersion> listVersionsByProject(@Param("projectId") Long projectId);

    int countVersion(@Param("documentId") Long documentId, @Param("version") String version);

    void insertVersion(DocumentVersion version);
}
