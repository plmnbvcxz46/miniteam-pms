package org.miniteam.pms.collab;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.miniteam.pms.collab.dto.CommentVO;
import org.miniteam.pms.collab.dto.DiscussionBriefVO;
import org.miniteam.pms.collab.dto.DiscussionDetailVO;
import org.miniteam.pms.collab.dto.DocumentRefVO;
import org.miniteam.pms.collab.entity.Comment;
import org.miniteam.pms.collab.entity.Discussion;
import org.miniteam.pms.collab.entity.DiscussionWithComments;
import org.miniteam.pms.task.TaskStatus;
import org.miniteam.pms.task.WorkdayCalendar;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.user.dto.UserBriefVO;

/** 讨论的展示口径，纯函数：实时接口和往期快照共用，不碰数据库。 */
public final class DiscussionViews {

    private DiscussionViews() {}

    /** 最近有动静的时间：最后一条评论，没有就是发起时间 */
    private static LocalDateTime activeAt(Discussion d) {
        return d.getLastCommentAt() != null ? d.getLastCommentAt() : d.getCreatedAt();
    }

    private static TaskRefVO taskRef(Discussion d) {
        return d.getTaskId() == null || d.getTaskNo() == null
                ? null
                : new TaskRefVO(d.getTaskId(), d.getTaskNo(), d.getTaskTitle());
    }

    public static DiscussionBriefVO brief(Discussion d) {
        return new DiscussionBriefVO(d.getId(), d.getTitle(), taskRef(d), d.getCommentCount(), d.getLastCommentAt());
    }

    /** 每个任务上的讨论简要信息，最近有回复的在前 */
    public static Map<Long, List<DiscussionBriefVO>> briefsByTask(List<Discussion> discussions) {
        Map<Long, List<DiscussionBriefVO>> map = new HashMap<>();
        discussions.stream()
                .filter(d -> d.getTaskId() != null)
                .sorted(newestFirst())
                .forEach(d -> map.computeIfAbsent(d.getTaskId(), k -> new ArrayList<>())
                        .add(brief(d)));
        return map;
    }

    private static Comparator<Discussion> newestFirst() {
        return Comparator.comparing(DiscussionViews::activeAt)
                .thenComparing(Discussion::getId)
                .reversed();
    }

    /**
     * 讨论在 date 这一天结束时的样子：只留这一天以前发起的讨论和写下的评论，
     * 评论数和最后评论时间按留下的评论重算，最近有回复的在前。
     */
    public static List<DiscussionWithComments> asOf(List<DiscussionWithComments> all, LocalDate date) {
        List<DiscussionWithComments> result = new ArrayList<>();
        for (DiscussionWithComments full : all) {
            Discussion d = full.discussion();
            if (d.getCreatedAt().toLocalDate().isAfter(date)) {
                continue;
            }
            List<Comment> kept = full.comments().stream()
                    .filter(c -> !c.getCreatedAt().toLocalDate().isAfter(date))
                    .toList();
            Discussion copy = new Discussion();
            copy.setId(d.getId());
            copy.setProjectId(d.getProjectId());
            copy.setTaskId(d.getTaskId());
            copy.setTitle(d.getTitle());
            copy.setCreatorId(d.getCreatorId());
            copy.setCreatorUsername(d.getCreatorUsername());
            copy.setCreatorRealName(d.getCreatorRealName());
            copy.setTaskNo(d.getTaskNo());
            copy.setTaskTitle(d.getTaskTitle());
            copy.setCommentCount(kept.size());
            copy.setLastCommentAt(
                    kept.isEmpty() ? null : kept.get(kept.size() - 1).getCreatedAt());
            copy.setCreatedAt(d.getCreatedAt());
            result.add(new DiscussionWithComments(copy, kept));
        }
        result.sort(Comparator.comparing((DiscussionWithComments x) -> activeAt(x.discussion()))
                .thenComparing(x -> x.discussion().getId())
                .reversed());
        return result;
    }

    /**
     * 讨论详情。tasks 是那一天的任务（关联的任务不在里面时不再关联），
     * users 和 docNames 用来把评论里 @ 的 ID 换成名字，找不到的跳过。
     */
    public static DiscussionDetailVO detail(
            DiscussionWithComments full,
            Map<Long, Task> tasks,
            LocalDate today,
            Map<Long, UserBriefVO> users,
            Map<Long, String> docNames) {
        Discussion d = full.discussion();
        Task task = d.getTaskId() == null ? null : tasks.get(d.getTaskId());
        DiscussionDetailVO.Task taskInfo = task == null
                ? null
                : new DiscussionDetailVO.Task(
                        task.getId(),
                        task.getTaskNo(),
                        task.getTitle(),
                        task.getStatus(),
                        WorkdayCalendar.overdueDays(
                                task.getDueDate(), today, TaskStatus.DONE.name().equals(task.getStatus())));
        return new DiscussionDetailVO(
                d.getId(),
                d.getTitle(),
                new UserBriefVO(d.getCreatorId(), d.getCreatorUsername(), d.getCreatorRealName()),
                d.getCreatedAt(),
                taskInfo,
                full.comments().stream().map(c -> comment(c, users, docNames)).toList());
    }

    public static CommentVO comment(Comment c, Map<Long, UserBriefVO> users, Map<Long, String> docNames) {
        List<Long> mentionIds = c.getMentions() == null ? List.of() : c.getMentions();
        List<Long> documentIds = c.getDocuments() == null ? List.of() : c.getDocuments();
        return new CommentVO(
                c.getId(),
                new UserBriefVO(c.getUserId(), c.getUserUsername(), c.getUserRealName()),
                c.getContent(),
                mentionIds.stream().map(users::get).filter(u -> u != null).toList(),
                documentIds.stream()
                        .filter(docNames::containsKey)
                        .map(id -> new DocumentRefVO(id, docNames.get(id)))
                        .toList(),
                c.getCreatedAt());
    }
}
