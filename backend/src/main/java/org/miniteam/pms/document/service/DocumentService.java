package org.miniteam.pms.document.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.common.storage.FileStorage;
import org.miniteam.pms.document.DocumentVersionNo;
import org.miniteam.pms.document.DocumentViews;
import org.miniteam.pms.document.dto.DocumentDetailVO;
import org.miniteam.pms.document.dto.DocumentItemVO;
import org.miniteam.pms.document.dto.DocumentVersionVO;
import org.miniteam.pms.document.entity.Document;
import org.miniteam.pms.document.entity.DocumentVersion;
import org.miniteam.pms.document.entity.DocumentWithVersions;
import org.miniteam.pms.document.mapper.DocumentMapper;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.ProjectPerm;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.task.TaskStatus;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** 文档：列表、详情、上传新文档、传新版本、定稿、下载。文件存在 {@link FileStorage}，库里只记元数据。 */
@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private static final String TARGET = "DOCUMENT";
    private static final Set<String> EXTENSIONS = Set.of("doc", "docx", "pdf", "md");
    private static final Set<String> CATEGORIES = Set.of("REQUIREMENT", "DESIGN", "API", "TEST", "MEETING", "OTHER");

    private final DocumentMapper documentMapper;
    private final TaskMapper taskMapper;
    private final MemberMapper memberMapper;
    private final ProjectAccess access;
    private final OperationLogService logService;
    private final FileStorage storage;

    public DocumentService(
            DocumentMapper documentMapper,
            TaskMapper taskMapper,
            MemberMapper memberMapper,
            ProjectAccess access,
            OperationLogService logService,
            FileStorage storage) {
        this.documentMapper = documentMapper;
        this.taskMapper = taskMapper;
        this.memberMapper = memberMapper;
        this.access = access;
        this.logService = logService;
        this.storage = storage;
    }

    /** 下载用：文件名、类型、大小和内容流（由调用方关闭） */
    public record Download(String fileName, String contentType, long size, InputStream content) {}

    // ---------- 读 ----------

    public List<DocumentItemVO> list(Long projectId, String status, String keyword, Long taskId, String category) {
        ProjectContext ctx = access.require(projectId);
        if (status != null && !status.isBlank()) {
            parseStatus(status);
        }
        String kw = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        Map<Long, Task> tasks = tasks(projectId);
        LocalDate today = today(ctx);
        return documentMapper.listByProject(projectId).stream()
                .filter(d -> status == null || status.isBlank() || status.equals(d.getStatus()))
                .filter(d -> taskId == null || taskId.equals(d.getTaskId()))
                .filter(d -> category == null || category.isBlank() || category.equals(d.getCategory()))
                .filter(d ->
                        kw.isEmpty() || d.getName().toLowerCase(Locale.ROOT).contains(kw))
                .map(d -> DocumentViews.item(d, tasks, today))
                .toList();
    }

    public DocumentDetailVO get(Long documentId) {
        Document doc = load(documentId);
        ProjectContext ctx = access.require(doc.getProjectId());
        return detail(ctx, doc);
    }

    /** 项目里全部文档和版本（新的在前），往期存档用，权限由调用方先校验 */
    public List<DocumentWithVersions> loadAll(Long projectId) {
        Map<Long, List<DocumentVersion>> versions = documentMapper.listVersionsByProject(projectId).stream()
                .collect(Collectors.groupingBy(DocumentVersion::getDocumentId));
        return documentMapper.listByProject(projectId).stream()
                .map(d -> new DocumentWithVersions(d, versions.getOrDefault(d.getId(), List.of())))
                .toList();
    }

    public Download download(Long versionId) {
        DocumentVersion version = documentMapper.findVersion(versionId);
        if (version == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件版本不存在");
        }
        Document doc = load(version.getDocumentId());
        access.require(doc.getProjectId());
        try {
            InputStream in = storage.open(version.getFilePath());
            return new Download(version.getFileName(), version.getContentType(), version.getFileSize(), in);
        } catch (FileNotFoundException e) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件已经找不到了，请联系项目经理重新上传");
        } catch (IOException e) {
            log.error("读取文档文件失败：版本 {}", versionId, e);
            throw storageUnavailable();
        }
    }

    // ---------- 写 ----------

    /** 上传新文档：建文档并把这个文件作为第一个版本 */
    @Transactional
    public DocumentDetailVO upload(
            Long projectId,
            MultipartFile file,
            String name,
            String category,
            Long taskId,
            Long ownerId,
            LocalDate dueDate,
            String version,
            String changeNote) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePermission(ProjectPerm.EDIT_DOC);
        ctx.requireWritable();
        String docName = name == null ? "" : name.trim();
        if (docName.isEmpty() || docName.length() > 128) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文档名称要填，且不超过 128 个字");
        }
        String docCategory = category == null || category.isBlank() ? "OTHER" : category.trim();
        if (!CATEGORIES.contains(docCategory)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文档分类不对");
        }
        String note = cleanNote(changeNote);
        String versionNo = version == null || version.isBlank() ? "v0.1" : checkVersion(version.trim());
        String extension = checkFile(file);

        if (taskId != null) {
            Task task = taskMapper.findById(taskId);
            if (task == null || !projectId.equals(task.getProjectId())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "关联的任务不存在，或不在这个项目里");
            }
            if (TaskStatus.DONE.name().equals(task.getStatus())) {
                throw new BusinessException(ResultCode.CONFLICT, "任务已经完成，不能再关联新文档");
            }
        }
        Long owner = ownerId == null ? ctx.user().id() : ownerId;
        if (!owner.equals(ctx.user().id()) && memberMapper.find(projectId, owner) == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "负责人必须是项目成员");
        }

        Document doc = new Document();
        doc.setProjectId(projectId);
        doc.setTaskId(taskId);
        doc.setName(docName);
        doc.setCategory(docCategory);
        doc.setOwnerId(owner);
        doc.setStatus(DocumentViews.REVISING);
        doc.setCurrentVersion(versionNo);
        doc.setDueDate(dueDate);
        documentMapper.insert(doc);

        storeVersion(ctx, doc, versionNo, note, file, extension);
        logService.record(
                ctx.user().id(),
                projectId,
                TARGET,
                doc.getId(),
                "UPLOAD",
                ctx.user().realName() + " 上传了文档《" + docName + "》" + versionNo);
        return detail(ctx, load(doc.getId()));
    }

    /** 给没定稿的文档传新版本，不给版本号就在当前版本上加 0.1 */
    @Transactional
    public DocumentVersionVO uploadVersion(Long documentId, MultipartFile file, String version, String changeNote) {
        Document doc = load(documentId);
        ProjectContext ctx = access.require(doc.getProjectId());
        ctx.requirePermission(ProjectPerm.EDIT_DOC);
        ctx.requireWritable();
        String note = cleanNote(changeNote);
        String extension = checkFile(file);
        documentMapper.lock(documentId);
        doc = load(documentId);
        if (DocumentViews.FINAL.equals(doc.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "文档已经定稿，不能再上传新版本");
        }
        String versionNo = version == null || version.isBlank()
                ? DocumentVersionNo.next(doc.getCurrentVersion())
                : checkVersion(version.trim());
        if (documentMapper.countVersion(documentId, versionNo) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "版本号 " + versionNo + " 已经有了");
        }
        DocumentVersion saved = storeVersion(ctx, doc, versionNo, note, file, extension);
        documentMapper.updateCurrentVersion(documentId, versionNo);
        logService.record(
                ctx.user().id(),
                doc.getProjectId(),
                TARGET,
                documentId,
                "VERSION",
                ctx.user().realName() + " 给文档《" + doc.getName() + "》上传了新版本 " + versionNo);
        return DocumentViews.version(documentMapper.findVersion(saved.getId()));
    }

    /** 定稿。定稿是单向的，已定稿的不能退回修订中 */
    @Transactional
    public DocumentItemVO changeStatus(Long documentId, String statusText) {
        Document doc = load(documentId);
        ProjectContext ctx = access.require(doc.getProjectId());
        ctx.requirePermission(ProjectPerm.EDIT_DOC);
        ctx.requireWritable();
        String status = parseStatus(statusText);
        documentMapper.lock(documentId);
        doc = load(documentId);
        if (!status.equals(doc.getStatus())) {
            if (DocumentViews.REVISING.equals(status)) {
                throw new BusinessException(ResultCode.CONFLICT, "已经定稿的文档不能改回修订中");
            }
            if (doc.getCurrentVersion() == null) {
                throw new BusinessException(ResultCode.CONFLICT, "还没有上传过文件，不能定稿");
            }
            documentMapper.finalizeDocument(documentId);
            logService.record(
                    ctx.user().id(),
                    doc.getProjectId(),
                    TARGET,
                    documentId,
                    "FINALIZE",
                    ctx.user().realName() + " 把文档《" + doc.getName() + "》定稿了");
        }
        return DocumentViews.item(load(documentId), tasks(doc.getProjectId()), today(ctx));
    }

    // ---------- 内部 ----------

    /** 先存文件再记版本，库里记失败时把已存的文件删掉 */
    private DocumentVersion storeVersion(
            ProjectContext ctx, Document doc, String versionNo, String note, MultipartFile file, String extension) {
        String key = doc.getProjectId() + "/" + doc.getId() + "/" + UUID.randomUUID() + "." + extension;
        try (InputStream in = file.getInputStream()) {
            storage.save(key, in, file.getSize(), file.getContentType());
        } catch (IOException e) {
            log.error("保存文档文件失败：文档 {}", doc.getId(), e);
            throw storageUnavailable();
        }
        DocumentVersion v = new DocumentVersion();
        v.setDocumentId(doc.getId());
        v.setVersion(versionNo);
        v.setChangeNote(note);
        v.setFileName(originalName(file));
        v.setFilePath(key);
        v.setFileSize(file.getSize());
        v.setContentType(trimTo(file.getContentType(), 128));
        v.setUploaderId(ctx.user().id());
        try {
            documentMapper.insertVersion(v);
        } catch (RuntimeException e) {
            deleteQuietly(key);
            throw e;
        }
        return v;
    }

    private void deleteQuietly(String key) {
        try {
            storage.delete(key);
        } catch (IOException e) {
            log.warn("清理没记成功的文件失败：{}", key, e);
        }
    }

    private DocumentDetailVO detail(ProjectContext ctx, Document doc) {
        List<DocumentVersion> versions = documentMapper.listVersions(doc.getId());
        return DocumentViews.detail(new DocumentWithVersions(doc, versions), tasks(doc.getProjectId()), today(ctx));
    }

    private Document load(Long documentId) {
        Document doc = documentMapper.findById(documentId);
        if (doc == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文档不存在");
        }
        return doc;
    }

    private Map<Long, Task> tasks(Long projectId) {
        return taskMapper.listByProject(projectId).stream().collect(Collectors.toMap(Task::getId, Function.identity()));
    }

    private static LocalDate today(ProjectContext ctx) {
        return IssueCalendar.effectiveDate(
                ctx.project().getStartDate(), ctx.project().getActualEnd(), IssueCalendar.today());
    }

    private static String parseStatus(String text) {
        if (DocumentViews.REVISING.equals(text) || DocumentViews.FINAL.equals(text)) {
            return text;
        }
        throw new BusinessException(ResultCode.BAD_REQUEST, "状态只能是 REVISING 或 FINAL");
    }

    private static String checkVersion(String version) {
        if (!DocumentVersionNo.valid(version)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "版本号格式应为 v主.次，例如 v0.6");
        }
        return version;
    }

    private static String cleanNote(String note) {
        String text = note == null ? "" : note.trim();
        if (text.length() > 255) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "版本说明不超过 255 个字");
        }
        return text.isEmpty() ? null : text;
    }

    /** 检查文件非空、扩展名允许，返回小写扩展名；大小上限由 spring.servlet.multipart 控制 */
    private static String checkFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请选择要上传的文件");
        }
        String name = originalName(file);
        int dot = name.lastIndexOf('.');
        String extension = dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!EXTENSIONS.contains(extension)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "只支持 Word、PDF、Markdown 文件（doc、docx、pdf、md）");
        }
        return extension;
    }

    /** 浏览器可能带路径（旧 IE），只留文件名 */
    private static String originalName(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        return trimTo(slash < 0 ? name : name.substring(slash + 1), 255);
    }

    private static String trimTo(String text, int max) {
        return text != null && text.length() > max ? text.substring(0, max) : text;
    }

    private static BusinessException storageUnavailable() {
        return new BusinessException(ResultCode.SERVER_ERROR, "文件存储暂时不可用，请稍后再试");
    }
}
