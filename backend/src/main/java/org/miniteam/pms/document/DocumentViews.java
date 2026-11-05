package org.miniteam.pms.document;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.miniteam.pms.document.dto.DocumentBriefVO;
import org.miniteam.pms.document.dto.DocumentDetailVO;
import org.miniteam.pms.document.dto.DocumentItemVO;
import org.miniteam.pms.document.dto.DocumentVersionVO;
import org.miniteam.pms.document.entity.Document;
import org.miniteam.pms.document.entity.DocumentVersion;
import org.miniteam.pms.document.entity.DocumentWithVersions;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 文档的展示口径，纯函数：实时接口和往期快照共用，不碰数据库。 */
public final class DocumentViews {

    public static final String REVISING = "REVISING";
    public static final String FINAL = "FINAL";

    private DocumentViews() {}

    /** 绑定了任务的文档，截止日跟着任务走；没绑任务的用自己的 */
    static LocalDate dueDate(Document d, Task task) {
        return task != null && task.getDueDate() != null ? task.getDueDate() : d.getDueDate();
    }

    /** 没定稿且已过截止日的天数，其他是 0 */
    static int overdueDays(Document d, LocalDate due, LocalDate today) {
        if (FINAL.equals(d.getStatus()) || due == null || !today.isAfter(due)) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(due, today);
    }

    public static DocumentItemVO item(Document d, Map<Long, Task> tasks, LocalDate today) {
        Task task = d.getTaskId() == null ? null : tasks.get(d.getTaskId());
        LocalDate due = dueDate(d, task);
        return new DocumentItemVO(
                d.getId(),
                d.getName(),
                d.getCategory(),
                TaskRefVO.of(task),
                new UserBriefVO(d.getOwnerId(), d.getOwnerUsername(), d.getOwnerRealName()),
                d.getStatus(),
                d.getCurrentVersion(),
                due,
                overdueDays(d, due, today),
                d.getCreatedAt(),
                d.getUpdatedAt(),
                d.getFinalizedAt());
    }

    public static DocumentVersionVO version(DocumentVersion v) {
        return new DocumentVersionVO(
                v.getId(),
                v.getVersion(),
                v.getChangeNote(),
                v.getFileName(),
                v.getFileSize() == null ? 0 : v.getFileSize(),
                v.getContentType(),
                new UserBriefVO(v.getUploaderId(), v.getUploaderUsername(), v.getUploaderRealName()),
                v.getCreatedAt(),
                "/api/document-versions/" + v.getId() + "/download");
    }

    public static DocumentDetailVO detail(DocumentWithVersions full, Map<Long, Task> tasks, LocalDate today) {
        return DocumentDetailVO.of(
                item(full.document(), tasks, today),
                full.versions().stream().map(DocumentViews::version).toList());
    }

    /** 每个任务上的文档简要信息，任务详情用 */
    public static Map<Long, List<DocumentBriefVO>> briefsByTask(
            List<Document> docs, Map<Long, Task> tasks, LocalDate today) {
        Map<Long, List<DocumentBriefVO>> result = new HashMap<>();
        for (Document d : docs) {
            Task task = d.getTaskId() == null ? null : tasks.get(d.getTaskId());
            if (task == null) {
                continue;
            }
            result.computeIfAbsent(d.getTaskId(), k -> new ArrayList<>())
                    .add(new DocumentBriefVO(
                            d.getId(),
                            d.getName(),
                            d.getCurrentVersion(),
                            d.getStatus(),
                            overdueDays(d, dueDate(d, task), today)));
        }
        return result;
    }

    /**
     * 文档在 date 那天的样子：只留那天以前的版本，最新版本和更新时间取其中最新的一条，
     * 第一个版本还没上传的文档不出现，定稿时间在那天之后的还算修订中。versions 要求新的在前。
     */
    public static List<DocumentWithVersions> asOf(List<DocumentWithVersions> all, LocalDate date) {
        List<DocumentWithVersions> result = new ArrayList<>();
        for (DocumentWithVersions full : all) {
            List<DocumentVersion> kept = full.versions().stream()
                    .filter(v -> !v.getCreatedAt().toLocalDate().isAfter(date))
                    .toList();
            if (kept.isEmpty()) {
                continue;
            }
            Document src = full.document();
            Document d = new Document();
            d.setId(src.getId());
            d.setProjectId(src.getProjectId());
            d.setTaskId(src.getTaskId());
            d.setName(src.getName());
            d.setCategory(src.getCategory());
            d.setOwnerId(src.getOwnerId());
            d.setOwnerUsername(src.getOwnerUsername());
            d.setOwnerRealName(src.getOwnerRealName());
            d.setDueDate(src.getDueDate());
            d.setCreatedAt(src.getCreatedAt());
            d.setCurrentVersion(kept.get(0).getVersion());
            d.setUpdatedAt(kept.get(0).getCreatedAt());
            boolean finalByThen = FINAL.equals(src.getStatus())
                    && src.getFinalizedAt() != null
                    && !src.getFinalizedAt().toLocalDate().isAfter(date);
            d.setStatus(finalByThen ? FINAL : REVISING);
            d.setFinalizedAt(finalByThen ? src.getFinalizedAt() : null);
            result.add(new DocumentWithVersions(d, kept));
        }
        return result;
    }
}
