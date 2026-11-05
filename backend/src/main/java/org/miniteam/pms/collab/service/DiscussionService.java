package org.miniteam.pms.collab.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.miniteam.pms.collab.DiscussionViews;
import org.miniteam.pms.collab.dto.CommentCreate;
import org.miniteam.pms.collab.dto.CommentVO;
import org.miniteam.pms.collab.dto.DiscussionBriefVO;
import org.miniteam.pms.collab.dto.DiscussionCreate;
import org.miniteam.pms.collab.dto.DiscussionDetailVO;
import org.miniteam.pms.collab.entity.Comment;
import org.miniteam.pms.collab.entity.Discussion;
import org.miniteam.pms.collab.entity.DiscussionWithComments;
import org.miniteam.pms.collab.entity.UserName;
import org.miniteam.pms.collab.mapper.DiscussionMapper;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.document.entity.Document;
import org.miniteam.pms.document.mapper.DocumentMapper;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 讨论和评论：项目成员都能看、能发起、能回复；评论里 @ 的人会收到通知。 */
@Service
public class DiscussionService {

    private static final String TARGET = "DISCUSSION";
    private static final int MAX_MENTIONS = 20;
    private static final int SNIPPET = 80;

    private final DiscussionMapper discussionMapper;
    private final TaskMapper taskMapper;
    private final MemberMapper memberMapper;
    private final DocumentMapper documentMapper;
    private final ProjectAccess access;
    private final OperationLogService logService;
    private final NotificationService notificationService;

    public DiscussionService(
            DiscussionMapper discussionMapper,
            TaskMapper taskMapper,
            MemberMapper memberMapper,
            DocumentMapper documentMapper,
            ProjectAccess access,
            OperationLogService logService,
            NotificationService notificationService) {
        this.discussionMapper = discussionMapper;
        this.taskMapper = taskMapper;
        this.memberMapper = memberMapper;
        this.documentMapper = documentMapper;
        this.access = access;
        this.logService = logService;
        this.notificationService = notificationService;
    }

    // ---------- 读 ----------

    public List<DiscussionBriefVO> list(Long projectId, Long taskId) {
        access.require(projectId);
        return discussionMapper.listByProject(projectId, taskId).stream()
                .map(DiscussionViews::brief)
                .toList();
    }

    public DiscussionDetailVO get(Long discussionId) {
        Discussion d = load(discussionId);
        ProjectContext ctx = access.require(d.getProjectId());
        return detail(ctx, d);
    }

    /** 项目里全部讨论和评论（最近有回复的在前），往期存档用，权限由调用方先校验 */
    public List<DiscussionWithComments> loadAll(Long projectId) {
        Map<Long, List<Comment>> comments = discussionMapper.listCommentsByProject(projectId).stream()
                .collect(Collectors.groupingBy(Comment::getDiscussionId));
        return discussionMapper.listByProject(projectId, null).stream()
                .map(d -> new DiscussionWithComments(d, comments.getOrDefault(d.getId(), List.of())))
                .toList();
    }

    /** 把存档里（或刚读出）的讨论换成接口里的详情，tasks 是那一天的任务 */
    public List<DiscussionDetailVO> details(
            Long projectId, List<DiscussionWithComments> raw, Map<Long, Task> tasks, LocalDate today) {
        Map<Long, UserBriefVO> users = users(raw.stream()
                .flatMap(x -> x.comments().stream())
                .flatMap(
                        c -> c.getMentions() == null ? java.util.stream.Stream.<Long>empty() : c.getMentions().stream())
                .toList());
        Map<Long, String> docNames = docNames(projectId);
        return raw.stream()
                .map(x -> DiscussionViews.detail(x, tasks, today, users, docNames))
                .toList();
    }

    // ---------- 写 ----------

    /** 发起讨论：同时写下第一条评论 */
    @Transactional
    public DiscussionDetailVO create(Long projectId, DiscussionCreate req) {
        ProjectContext ctx = access.require(projectId);
        ctx.requireWritable();
        String title = req.title().trim();
        String content = req.content().trim();
        if (title.isEmpty() || content.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "讨论标题和内容都要填");
        }
        if (req.taskId() != null) {
            Task task = taskMapper.findById(req.taskId());
            if (task == null || !projectId.equals(task.getProjectId())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "关联的任务不存在，或不在这个项目里");
            }
        }
        List<Long> mentionIds = checkMentions(projectId, req.mentionIds());
        List<Long> documentIds = checkDocuments(req.taskId(), req.documentIds());

        Discussion d = new Discussion();
        d.setProjectId(projectId);
        d.setTaskId(req.taskId());
        d.setTitle(title);
        d.setCreatorId(ctx.user().id());
        discussionMapper.insert(d);
        Comment first = insertComment(d.getId(), ctx, content, mentionIds, documentIds);

        logService.record(
                ctx.user().id(),
                projectId,
                TARGET,
                d.getId(),
                "CREATE",
                ctx.user().realName() + " 发起讨论 <b>" + title + "</b>");
        notifyMentions(ctx, d.getProjectId(), d.getId(), title, first, mentionIds);
        return detail(ctx, load(d.getId()));
    }

    @Transactional
    public CommentVO addComment(Long discussionId, CommentCreate req) {
        Discussion d = load(discussionId);
        ProjectContext ctx = access.require(d.getProjectId());
        ctx.requireWritable();
        String content = req.content().trim();
        if (content.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "内容不能为空");
        }
        List<Long> mentionIds = checkMentions(d.getProjectId(), req.mentionIds());
        List<Long> documentIds = checkDocuments(d.getTaskId(), req.documentIds());
        Comment saved = insertComment(discussionId, ctx, content, mentionIds, documentIds);

        logService.record(
                ctx.user().id(),
                d.getProjectId(),
                TARGET,
                discussionId,
                "COMMENT",
                ctx.user().realName() + " 回复了 <b>" + d.getTitle() + "</b>");
        notifyMentions(ctx, d.getProjectId(), discussionId, d.getTitle(), saved, mentionIds);
        return DiscussionViews.comment(
                discussionMapper.findComment(saved.getId()), users(mentionIds), docNames(d.getProjectId()));
    }

    // ---------- 内部 ----------

    private Comment insertComment(
            Long discussionId, ProjectContext ctx, String content, List<Long> mentionIds, List<Long> documentIds) {
        Comment c = new Comment();
        c.setDiscussionId(discussionId);
        c.setUserId(ctx.user().id());
        c.setContent(content);
        c.setMentions(mentionIds);
        c.setDocuments(documentIds);
        discussionMapper.insertComment(c);
        discussionMapper.bump(discussionId);
        return c;
    }

    /** @ 的人必须是项目成员；去重，最多 20 个 */
    private List<Long> checkMentions(Long projectId, List<Long> ids) {
        List<Long> unique = distinct(ids);
        if (unique.size() > MAX_MENTIONS) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "一条消息最多 @ " + MAX_MENTIONS + " 个人");
        }
        for (Long id : unique) {
            if (memberMapper.find(projectId, id) == null) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "被 @ 的人不是这个项目的成员");
            }
        }
        return unique;
    }

    /** @ 的文档必须属于讨论所属的任务；去重 */
    private List<Long> checkDocuments(Long taskId, List<Long> ids) {
        List<Long> unique = distinct(ids);
        if (unique.isEmpty()) {
            return unique;
        }
        if (taskId == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "没有关联任务的讨论不能 @ 文档");
        }
        for (Long id : unique) {
            Document doc = documentMapper.findById(id);
            if (doc == null || !taskId.equals(doc.getTaskId())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "@ 的文档必须是讨论所属任务下的文档");
            }
        }
        return unique;
    }

    private static List<Long> distinct(List<Long> ids) {
        return ids == null ? List.of() : new ArrayList<>(new LinkedHashSet<>(ids));
    }

    /** 给被 @ 的人（不含自己）发通知，点开直接定位到这条评论 */
    private void notifyMentions(
            ProjectContext ctx,
            Long projectId,
            Long discussionId,
            String title,
            Comment comment,
            List<Long> mentionIds) {
        String snippet = comment.getContent().length() > SNIPPET
                ? comment.getContent().substring(0, SNIPPET) + "…"
                : comment.getContent();
        for (Long userId : mentionIds) {
            if (userId.equals(ctx.user().id())) {
                continue;
            }
            notificationService.send(
                    userId,
                    projectId,
                    NotificationService.MENTION,
                    ctx.user().realName() + " 在「" + title + "」里提到了你",
                    snippet,
                    "/collab?discussionId=" + discussionId + "&commentId=" + comment.getId());
        }
    }

    private DiscussionDetailVO detail(ProjectContext ctx, Discussion d) {
        Map<Long, Task> tasks = new HashMap<>();
        if (d.getTaskId() != null) {
            Task task = taskMapper.findById(d.getTaskId());
            if (task != null) {
                tasks.put(task.getId(), task);
            }
        }
        LocalDate today = IssueCalendar.effectiveDate(
                ctx.project().getStartDate(), ctx.project().getActualEnd(), IssueCalendar.today());
        DiscussionWithComments full = new DiscussionWithComments(d, discussionMapper.listComments(d.getId()));
        return details(d.getProjectId(), List.of(full), tasks, today).get(0);
    }

    private Discussion load(Long discussionId) {
        Discussion d = discussionMapper.findById(discussionId);
        if (d == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "讨论不存在");
        }
        return d;
    }

    private Map<Long, UserBriefVO> users(Collection<Long> ids) {
        Collection<Long> unique = new LinkedHashSet<>(ids);
        if (unique.isEmpty()) {
            return Map.of();
        }
        return discussionMapper.listUsers(unique).stream()
                .collect(Collectors.toMap(
                        UserName::getId,
                        u -> new UserBriefVO(u.getId(), u.getUsername(), u.getRealName()),
                        (a, b) -> a));
    }

    private Map<Long, String> docNames(Long projectId) {
        return documentMapper.listByProject(projectId).stream()
                .collect(Collectors.toMap(Document::getId, Document::getName, (a, b) -> a, HashMap::new));
    }
}
