package org.miniteam.pms.document;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.document.dto.DocumentBriefVO;
import org.miniteam.pms.document.dto.DocumentItemVO;
import org.miniteam.pms.document.entity.Document;
import org.miniteam.pms.document.entity.DocumentVersion;
import org.miniteam.pms.document.entity.DocumentWithVersions;
import org.miniteam.pms.task.entity.Task;

class DocumentViewsTest {

    private static final LocalDate TODAY = LocalDate.parse("2026-10-26");

    private static Task task(long id, String due) {
        Task t = new Task();
        t.setId(id);
        t.setTaskNo((int) id);
        t.setTitle("任务" + id);
        t.setDueDate(due == null ? null : LocalDate.parse(due));
        return t;
    }

    private static Document doc(long id, Long taskId, String status, String ownDue) {
        Document d = new Document();
        d.setId(id);
        d.setProjectId(1L);
        d.setTaskId(taskId);
        d.setName("文档" + id);
        d.setCategory("OTHER");
        d.setOwnerId(9L);
        d.setStatus(status);
        d.setCurrentVersion("v0.3");
        d.setDueDate(ownDue == null ? null : LocalDate.parse(ownDue));
        d.setCreatedAt(LocalDateTime.parse("2026-10-10T09:00:00"));
        return d;
    }

    private static DocumentVersion version(long id, String no, String at) {
        DocumentVersion v = new DocumentVersion();
        v.setId(id);
        v.setVersion(no);
        v.setCreatedAt(LocalDateTime.parse(at));
        return v;
    }

    @Test
    void dueDateFollowsTheTaskAndOverdueCountsDaysAfterIt() {
        Map<Long, Task> tasks = Map.of(5L, task(5, "2026-10-22"));
        DocumentItemVO bound = DocumentViews.item(doc(1, 5L, "REVISING", "2026-10-30"), tasks, TODAY);
        assertEquals(LocalDate.parse("2026-10-22"), bound.dueDate());
        assertEquals(4, bound.overdueDays());
        assertEquals(5L, bound.task().id());

        DocumentItemVO free = DocumentViews.item(doc(2, null, "REVISING", "2026-10-30"), tasks, TODAY);
        assertEquals(LocalDate.parse("2026-10-30"), free.dueDate());
        assertEquals(0, free.overdueDays());
        assertNull(free.task());
    }

    @Test
    void finalDocumentsAreNeverOverdue() {
        Map<Long, Task> tasks = Map.of(5L, task(5, "2026-10-22"));
        assertEquals(
                0, DocumentViews.item(doc(1, 5L, "FINAL", null), tasks, TODAY).overdueDays());
    }

    @Test
    void briefsAreGroupedByTask() {
        Map<Long, Task> tasks = Map.of(5L, task(5, "2026-10-25"), 6L, task(6, null));
        Map<Long, List<DocumentBriefVO>> briefs = DocumentViews.briefsByTask(
                List.of(doc(1, 5L, "REVISING", null), doc(2, 5L, "FINAL", null), doc(3, null, "REVISING", null)),
                tasks,
                TODAY);
        assertEquals(2, briefs.get(5L).size());
        assertEquals(1, briefs.get(5L).get(0).overdueDays());
        assertEquals(0, briefs.get(5L).get(1).overdueDays());
        assertEquals(1, briefs.size());
    }

    @Test
    void asOfKeepsOnlyVersionsUpToThatDay() {
        Document d = doc(1, null, "FINAL", null);
        d.setFinalizedAt(LocalDateTime.parse("2026-10-20T10:00:00"));
        DocumentWithVersions full = new DocumentWithVersions(
                d,
                List.of(
                        version(3, "v0.3", "2026-10-20T09:00:00"),
                        version(2, "v0.2", "2026-10-15T09:00:00"),
                        version(1, "v0.1", "2026-10-12T09:00:00")));

        // 定稿那天之前：修订中，最新版本是当天已有的最后一个
        DocumentWithVersions mid =
                DocumentViews.asOf(List.of(full), LocalDate.parse("2026-10-16")).get(0);
        assertEquals("v0.2", mid.document().getCurrentVersion());
        assertEquals("REVISING", mid.document().getStatus());
        assertNull(mid.document().getFinalizedAt());
        assertEquals(2, mid.versions().size());

        // 定稿当天：已定稿
        DocumentWithVersions done =
                DocumentViews.asOf(List.of(full), LocalDate.parse("2026-10-20")).get(0);
        assertEquals("FINAL", done.document().getStatus());
        assertEquals("v0.3", done.document().getCurrentVersion());

        // 第一个版本还没上传：不出现
        assertEquals(
                0,
                DocumentViews.asOf(List.of(full), LocalDate.parse("2026-10-11")).size());
    }
}
