package org.miniteam.pms.collab;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.miniteam.pms.collab.dto.DiscussionBriefVO;
import org.miniteam.pms.collab.dto.DiscussionDetailVO;
import org.miniteam.pms.collab.entity.Comment;
import org.miniteam.pms.collab.entity.Discussion;
import org.miniteam.pms.collab.entity.DiscussionWithComments;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.user.dto.UserBriefVO;

class DiscussionViewsTest {

    private static LocalDateTime at(String text) {
        return LocalDateTime.parse(text);
    }

    private static Comment comment(long id, String when, List<Long> mentions, List<Long> documents) {
        Comment c = new Comment();
        c.setId(id);
        c.setUserId(7L);
        c.setUserUsername("u7");
        c.setUserRealName("七号");
        c.setContent("内容" + id);
        c.setMentions(mentions);
        c.setDocuments(documents);
        c.setCreatedAt(at(when));
        return c;
    }

    private static DiscussionWithComments discussion(long id, Long taskId, String created, List<Comment> comments) {
        Discussion d = new Discussion();
        d.setId(id);
        d.setProjectId(1L);
        d.setTaskId(taskId);
        d.setTitle("讨论" + id);
        d.setCreatorId(7L);
        d.setCreatorUsername("u7");
        d.setCreatorRealName("七号");
        d.setTaskNo(taskId == null ? null : taskId.intValue());
        d.setTaskTitle(taskId == null ? null : "任务" + taskId);
        d.setCommentCount(comments.size());
        d.setLastCommentAt(
                comments.isEmpty() ? null : comments.get(comments.size() - 1).getCreatedAt());
        d.setCreatedAt(at(created));
        return new DiscussionWithComments(d, comments);
    }

    @Test
    void asOfKeepsOnlyWhatHappenedByThatDayAndRecountsComments() {
        var early = discussion(
                1,
                5L,
                "2026-10-20T09:00:00",
                List.of(
                        comment(1, "2026-10-20T09:00:00", List.of(), List.of()),
                        comment(2, "2026-10-21T10:00:00", List.of(), List.of()),
                        comment(3, "2026-10-23T10:00:00", List.of(), List.of())));
        var later = discussion(
                2, null, "2026-10-22T09:00:00", List.of(comment(4, "2026-10-22T09:00:00", List.of(), List.of())));

        List<DiscussionWithComments> onTheTwentyFirst =
                DiscussionViews.asOf(List.of(later, early), LocalDate.parse("2026-10-21"));
        assertEquals(1, onTheTwentyFirst.size());
        assertEquals(2, onTheTwentyFirst.get(0).comments().size());
        assertEquals(2, onTheTwentyFirst.get(0).discussion().getCommentCount());
        assertEquals(
                at("2026-10-21T10:00:00"), onTheTwentyFirst.get(0).discussion().getLastCommentAt());

        // 后来的讨论排在前面（最近有动静的在前）
        List<DiscussionWithComments> onTheTwentyThird =
                DiscussionViews.asOf(List.of(early, later), LocalDate.parse("2026-10-23"));
        assertEquals(
                List.of(1L, 2L),
                onTheTwentyThird.stream().map(x -> x.discussion().getId()).toList());
        assertEquals(3, onTheTwentyThird.get(0).discussion().getCommentCount());
        // 原数据不被改
        assertEquals(3, early.discussion().getCommentCount());
    }

    @Test
    void briefsByTaskGroupsAndOrdersNewestFirst() {
        var a = discussion(
                1, 5L, "2026-10-20T09:00:00", List.of(comment(1, "2026-10-20T09:00:00", List.of(), List.of())));
        var b = discussion(
                2, 5L, "2026-10-21T09:00:00", List.of(comment(2, "2026-10-21T09:00:00", List.of(), List.of())));
        var c = discussion(3, null, "2026-10-21T09:00:00", List.of());
        Map<Long, List<DiscussionBriefVO>> map =
                DiscussionViews.briefsByTask(List.of(a.discussion(), b.discussion(), c.discussion()));
        assertEquals(List.of(5L), List.copyOf(map.keySet()));
        assertEquals(
                List.of(2L, 1L), map.get(5L).stream().map(DiscussionBriefVO::id).toList());
        assertEquals(5, map.get(5L).get(0).task().taskNo());
    }

    @Test
    void detailResolvesMentionsAndDocumentsAndTaskState() {
        var full = discussion(
                1,
                5L,
                "2026-10-20T09:00:00",
                List.of(comment(1, "2026-10-20T09:00:00", List.of(8L, 99L), List.of(30L, 31L))));
        Task task = new Task();
        task.setId(5L);
        task.setTaskNo(5);
        task.setTitle("任务5");
        task.setStatus("DOING");
        task.setDueDate(LocalDate.parse("2026-10-22"));
        DiscussionDetailVO detail = DiscussionViews.detail(
                full,
                Map.of(5L, task),
                LocalDate.parse("2026-10-26"),
                Map.of(8L, new UserBriefVO(8L, "u8", "八号")),
                Map.of(30L, "设计文档"));
        assertEquals("DOING", detail.task().status());
        assertEquals(4, detail.task().overdueDays());
        var c = detail.comments().get(0);
        // 找不到的用户和文档（比如已不存在）直接跳过
        assertEquals(
                List.of("八号"), c.mentions().stream().map(UserBriefVO::realName).toList());
        assertEquals(1, c.documents().size());
        assertEquals("设计文档", c.documents().get(0).name());
    }

    @Test
    void taskThatNoLongerExistsIsNotLinked() {
        var full = discussion(1, 5L, "2026-10-20T09:00:00", List.of());
        DiscussionDetailVO detail =
                DiscussionViews.detail(full, Map.of(), LocalDate.parse("2026-10-26"), Map.of(), Map.of());
        assertNull(detail.task());
    }
}
