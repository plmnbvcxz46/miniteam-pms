package org.miniteam.pms.document.controller;

import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.document.dto.DocumentDetailVO;
import org.miniteam.pms.document.dto.DocumentItemVO;
import org.miniteam.pms.document.dto.DocumentStatusChange;
import org.miniteam.pms.document.dto.DocumentVersionVO;
import org.miniteam.pms.document.service.DocumentService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/projects/{projectId}/documents")
    public Result<List<DocumentItemVO>> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) String category) {
        return Result.ok(documentService.list(projectId, status, keyword, taskId, category));
    }

    @PostMapping(value = "/projects/{projectId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<DocumentDetailVO> upload(
            @PathVariable Long projectId,
            @RequestPart("file") MultipartFile file,
            @RequestParam String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) String version,
            @RequestParam(required = false) String changeNote) {
        return Result.ok(
                documentService.upload(projectId, file, name, category, taskId, ownerId, dueDate, version, changeNote));
    }

    @GetMapping("/documents/{documentId}")
    public Result<DocumentDetailVO> get(@PathVariable Long documentId) {
        return Result.ok(documentService.get(documentId));
    }

    @PutMapping("/documents/{documentId}/status")
    public Result<DocumentItemVO> changeStatus(
            @PathVariable Long documentId, @Valid @RequestBody DocumentStatusChange request) {
        return Result.ok(documentService.changeStatus(documentId, request.status()));
    }

    @PostMapping(value = "/documents/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<DocumentVersionVO> uploadVersion(
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String version,
            @RequestParam(required = false) String changeNote) {
        return Result.ok(documentService.uploadVersion(documentId, file, version, changeNote));
    }

    @GetMapping("/document-versions/{versionId}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable Long versionId) {
        DocumentService.Download file = documentService.download(versionId);
        MediaType type = MediaType.APPLICATION_OCTET_STREAM;
        if (file.contentType() != null) {
            try {
                type = MediaType.parseMediaType(file.contentType());
            } catch (RuntimeException ignored) {
                // 上传时浏览器给的类型不规范，按二进制流下载
            }
        }
        return ResponseEntity.ok()
                .contentType(type)
                .contentLength(file.size())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(file.fileName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(new InputStreamResource(file.content()));
    }
}
