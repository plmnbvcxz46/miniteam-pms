package org.miniteam.pms.task.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.ProjectPerm;
import org.miniteam.pms.project.dto.ActivityVO;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.system.mapper.ConfigMapper;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.task.DependencyGraph;
import org.miniteam.pms.task.PriorityCalculator;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.TaskStatus;
import org.miniteam.pms.task.WorkdayCalendar;
import org.miniteam.pms.task.dto.BoardVO;
import org.miniteam.pms.task.dto.DependencyTaskVO;
import org.miniteam.pms.task.dto.PriorityVO;
import org.miniteam.pms.task.dto.TaskCardVO;
import org.miniteam.pms.task.dto.TaskCreate;
import org.miniteam.pms.task.dto.TaskDetailVO;
import org.miniteam.pms.task.dto.TaskPosition;
import org.miniteam.pms.task.dto.TaskRefVO;
import org.miniteam.pms.task.dto.TaskUpdate;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.entity.TaskDependency;
import org.miniteam.pms.task.mapper.DependencyMapper;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 任务：列表、看板、详情、新建、修改、删除、改状态、拖动排序、前置任务、任务动态。
 * 优先级得分和关键路径标记在读的时候按项目里的全部任务现算（{@link PriorityCalculator}、{@link CriticalPath}），不落库。
 */
@Service
public class TaskService {

    private static final String TARGET_TASK = "TASK";
    private static final Map<TaskStatus, String> STATUS_LABEL = Map.of(
            TaskStatus.TODO, "待开始",
            TaskStatus.DOING, "进行中",
            TaskStatus.BLOCKED, "阻塞",
            TaskStatus.DONE, "已完成");

    private final TaskMapper taskMapper;
    private final DependencyMapper dependencyMapper;
    private final MemberMapper memberMapper;
    private final ConfigMapper configMapper;
    private final ProjectAccess access;
    private final OperationLogService logService;

    public TaskService(
            TaskMapper taskMapper,
            DependencyMapper dependencyMapper,
            MemberMapper memberMapper,
            ConfigMapper configMapper,
            ProjectAccess access,
            OperationLogService logService) {
        this.taskMapper = taskMapper;
        this.dependencyMapper = dependencyMapper;
        this.memberMapper = memberMapper;
        this.configMapper = configMapper;
        this.access = access;
        this.logService = logService;
    }

    private ProjectTaskSnapshot snapshot(ProjectContext ctx) {
        Long projectId = ctx.project().getId();
        Map<String, String> configs = configMapper.listAll().stream()
                .collect(Collectors.toMap(c -> c.getConfigKey(), c -> c.getConfigValue(), (a, b) -> a));
        LocalDate today = IssueCalendar.effectiveDate(
                ctx.project().getStartDate(), ctx.project().getActualEnd(), IssueCalendar.today());
        return new ProjectTaskSnapshot(
                today, taskMapper.listByProject(projectId), dependencyMapper.listByProject(projectId), configs);
    }

    // ---------- 读 ----------

    /** 列表，detail 为 true 时每项带详情字段（TaskDetail），前端一次取完整任务表用 */
    public List<?> list(
            Long projectId,
            String status,
            Long assigneeId,
            boolean mine,
            boolean criticalOnly,
            Long parentId,
            String keyword,
            boolean detail) {
        ProjectContext ctx = access.require(projectId);
        ProjectTaskSnapshot snap = snapshot(ctx);
        TaskStatus wanted = status == null || status.isBlank() ? null : TaskStatus.parse(status);
        String kw = keyword == null ? "" : keyword.trim().toLowerCase();
        return snap.tasks.stream()
                .filter(t -> visible(ctx, snap, t))
                .filter(t -> wanted == null || t.getStatus().equals(wanted.name()))
                .filter(t -> assigneeId == null || assigneeId.equals(t.getAssigneeId()))
                .filter(t -> !mine || ctx.user().id().equals(t.getAssigneeId()))
                .filter(t -> !criticalOnly || snap.critical.get(t.getId()))
                .filter(t -> parentId == null || parentId.equals(t.getParentId()))
                .filter(t ->
                        kw.isEmpty() || t.getTitle().toLowerCase().contains(kw) || ("t-" + t.getTaskNo()).equals(kw))
                .map(t -> detail ? (Object) detail(t, snap) : card(t, snap))
                .toList();
    }

    public BoardVO board(Long projectId, String filter) {
        ProjectContext ctx = access.require(projectId);
        ProjectTaskSnapshot snap = snapshot(ctx);
        String f = filter == null || filter.isBlank() ? "all" : filter;
        if (!List.of("all", "mine", "critical").contains(f)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "filter 只能是 all、mine、critical");
        }
        List<Task> shown = snap.tasks.stream()
                .filter(t -> visible(ctx, snap, t))
                .filter(t -> !f.equals("mine") || ctx.user().id().equals(t.getAssigneeId()))
                .filter(t -> !f.equals("critical") || snap.critical.get(t.getId()))
                .toList();
        Map<String, List<TaskCardVO>> columns = new LinkedHashMap<>();
        for (TaskStatus s : TaskStatus.values()) {
            columns.put(
                    s.name(),
                    shown.stream()
                            .filter(t -> t.getStatus().equals(s.name()))
                            .map(t -> card(t, snap))
                            .toList());
        }
        Set<Long> shownIds = shown.stream().map(Task::getId).collect(Collectors.toSet());
        List<BoardVO.BlockedImpact> impacts = new ArrayList<>();
        for (Task blocked : shown) {
            if (!TaskStatus.BLOCKED.name().equals(blocked.getStatus())) {
                continue;
            }
            for (Long nextId : snap.succs.getOrDefault(blocked.getId(), List.of())) {
                Task next = snap.byId.get(nextId);
                if (!isDone(next) && shownIds.contains(nextId)) {
                    impacts.add(
                            new BoardVO.BlockedImpact(TaskRefVO.of(next), next.getDueDate(), TaskRefVO.of(blocked)));
                }
            }
        }
        return new BoardVO(columns, impacts);
    }

    public TaskDetailVO get(Long taskId) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        ProjectTaskSnapshot snap = snapshot(ctx);
        if (!visible(ctx, snap, task)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "没有权限查看这个任务");
        }
        return detail(task, snap);
    }

    public List<ActivityVO> activities(Long taskId) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        if (!visible(ctx, snapshot(ctx), task)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "没有权限查看这个任务");
        }
        return logService.listByProject(task.getProjectId(), TARGET_TASK, taskId, null, 100).stream()
                .map(ActivityVO::of)
                .toList();
    }

    // ---------- 写 ----------

    @Transactional
    public TaskDetailVO create(Long projectId, TaskCreate req) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePermission(ProjectPerm.EDIT_TASK);
        ctx.requireWritable();
        taskMapper.lockProject(projectId);

        TaskStatus status =
                req.status() == null || req.status().isBlank() ? TaskStatus.TODO : TaskStatus.parse(req.status());
        int planDays = req.planDays() == null ? 1 : req.planDays();
        LocalDate dueDate = req.dueDate();
        if (dueDate == null && req.planStart() != null) {
            dueDate = WorkdayCalendar.dueDate(req.planStart(), planDays);
        }
        checkDates(req.planStart(), dueDate);
        requireMember(projectId, req.assigneeId());
        requireParent(projectId, req.parentId(), null);

        Task task = new Task();
        task.setProjectId(projectId);
        task.setTaskNo(taskMapper.maxTaskNo(projectId) + 1);
        task.setParentId(req.parentId());
        task.setTitle(req.title().trim());
        task.setDescription(blankToNull(req.description()));
        task.setAssigneeId(req.assigneeId());
        task.setCreatorId(ctx.user().id());
        task.setImportance(req.importance() == null ? 3 : req.importance());
        task.setUrgency(req.urgency() == null ? 3 : req.urgency());
        task.setPlanDays(planDays);
        task.setEstHours(req.estHours() == null ? planDays * 8.0 : req.estHours());
        task.setRequiredSkills(req.requiredSkills() == null ? List.of() : req.requiredSkills());
        task.setPlanStart(req.planStart());
        task.setDueDate(dueDate);
        task.setSortOrder(0);
        task.setStatus(TaskStatus.TODO.name());
        task.setProgress(0);
        ProjectTaskSnapshot before = snapshot(ctx);
        applyStatus(task, status, before.today);
        taskMapper.insert(task);
        place(task, status, 0);
        taskMapper.updateStatus(task);

        if (req.predecessorIds() != null && !req.predecessorIds().isEmpty()) {
            replacePredecessors(ctx, task, req.predecessorIds());
        }
        logService.record(
                ctx.user().id(),
                projectId,
                TARGET_TASK,
                task.getId(),
                "CREATE",
                ctx.user().realName() + " 创建任务");
        return reload(ctx, task.getId());
    }

    @Transactional
    public TaskDetailVO update(Long taskId, TaskUpdate req) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        ctx.requirePermission(ProjectPerm.EDIT_TASK);
        ctx.requireWritable();

        List<String> changes = new ArrayList<>();
        if (req.getTitle() != null
                && !req.getTitle().isBlank()
                && !req.getTitle().trim().equals(task.getTitle())) {
            task.setTitle(req.getTitle().trim());
            changes.add("标题");
        }
        if (req.getDescription() != null && !Objects.equals(blankToNull(req.getDescription()), task.getDescription())) {
            task.setDescription(blankToNull(req.getDescription()));
            changes.add("描述");
        }
        if (req.isAssigneeIdSet() && !Objects.equals(req.getAssigneeId(), task.getAssigneeId())) {
            requireMember(task.getProjectId(), req.getAssigneeId());
            task.setAssigneeId(req.getAssigneeId());
            changes.add("负责人");
        }
        if (req.isParentIdSet() && !Objects.equals(req.getParentId(), task.getParentId())) {
            requireParent(task.getProjectId(), req.getParentId(), task.getId());
            task.setParentId(req.getParentId());
            changes.add("父任务");
        }
        if (req.getImportance() != null && !req.getImportance().equals(task.getImportance())) {
            task.setImportance(req.getImportance());
            changes.add("重要度");
        }
        if (req.getUrgency() != null && !req.getUrgency().equals(task.getUrgency())) {
            task.setUrgency(req.getUrgency());
            changes.add("紧急度");
        }
        if (req.getEstHours() != null && !req.getEstHours().equals(task.getEstHours())) {
            task.setEstHours(req.getEstHours());
            changes.add("预估工时");
        }
        if (req.getRequiredSkills() != null && !req.getRequiredSkills().equals(task.getRequiredSkills())) {
            task.setRequiredSkills(req.getRequiredSkills());
            changes.add("所需技能");
        }
        boolean planChanged = false;
        if (req.getPlanDays() != null && !req.getPlanDays().equals(task.getPlanDays())) {
            task.setPlanDays(req.getPlanDays());
            changes.add("工期");
            planChanged = true;
        }
        if (req.isPlanStartSet() && !Objects.equals(req.getPlanStart(), task.getPlanStart())) {
            task.setPlanStart(req.getPlanStart());
            changes.add("计划开始");
            planChanged = true;
        }
        if (req.isDueDateSet()) {
            if (!Objects.equals(req.getDueDate(), task.getDueDate())) {
                task.setDueDate(req.getDueDate());
                changes.add("截止日期");
            }
        } else if (planChanged && task.getPlanStart() != null) {
            LocalDate due = WorkdayCalendar.dueDate(task.getPlanStart(), task.getPlanDays());
            if (!due.equals(task.getDueDate())) {
                task.setDueDate(due);
                changes.add("截止日期");
            }
        }
        checkDates(task.getPlanStart(), task.getDueDate());
        if (!changes.isEmpty()) {
            taskMapper.update(task);
            logService.record(
                    ctx.user().id(),
                    task.getProjectId(),
                    TARGET_TASK,
                    taskId,
                    "UPDATE",
                    ctx.user().realName() + " 修改了任务（" + String.join("、", changes) + "）");
        }
        return reload(ctx, taskId);
    }

    @Transactional
    public void delete(Long taskId) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        ctx.requirePm();
        ctx.requireWritable();
        taskMapper.lockProject(task.getProjectId());
        taskMapper.delete(taskId);
        renumber(task.getProjectId(), task.getStatus(), null);
        logService.record(
                ctx.user().id(),
                task.getProjectId(),
                TARGET_TASK,
                taskId,
                "DELETE",
                ctx.user().realName() + " 删除了任务「" + task.getTitle() + "」");
    }

    /** 改状态，放到目标列最前面；状态没变就什么也不做 */
    @Transactional
    public TaskCardVO changeStatus(Long taskId, String statusText) {
        TaskStatus status = TaskStatus.parse(statusText);
        return move(taskId, status, status.name().equals(load(taskId).getStatus()) ? null : 0);
    }

    /** 看板拖动：换列和调整位置 */
    @Transactional
    public TaskCardVO position(Long taskId, TaskPosition req) {
        return move(taskId, TaskStatus.parse(req.status()), req.index());
    }

    private TaskCardVO move(Long taskId, TaskStatus status, Integer index) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        ctx.requireWritable();
        if (!ctx.can(ProjectPerm.EDIT_TASK) && !ctx.user().id().equals(task.getAssigneeId())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只能移动自己负责的任务");
        }
        taskMapper.lockProject(task.getProjectId());
        task = load(taskId);
        TaskStatus old = TaskStatus.parse(task.getStatus());
        if (index != null) {
            ProjectTaskSnapshot snap = snapshot(ctx);
            if (old != status) {
                applyStatus(task, status, snap.today);
            }
            place(task, status, index);
            taskMapper.updateStatus(task);
            if (old != status) {
                renumber(task.getProjectId(), old.name(), task.getId());
                logService.record(
                        ctx.user().id(),
                        task.getProjectId(),
                        TARGET_TASK,
                        taskId,
                        "STATUS",
                        ctx.user().realName() + " 把任务移到" + STATUS_LABEL.get(status));
            }
        }
        ProjectTaskSnapshot snap = snapshot(ctx);
        return card(snap.byId.get(taskId), snap);
    }

    @Transactional
    public List<DependencyTaskVO> setPredecessors(Long taskId, List<Long> preTaskIds) {
        Task task = load(taskId);
        ProjectContext ctx = access.require(task.getProjectId());
        ctx.requirePermission(ProjectPerm.EDIT_TASK);
        ctx.requireWritable();
        taskMapper.lockProject(task.getProjectId());
        replacePredecessors(ctx, task, preTaskIds);
        ProjectTaskSnapshot snap = snapshot(ctx);
        return dependencies(snap, snap.preds.getOrDefault(taskId, List.of()), taskId, true);
    }

    // ---------- 内部 ----------

    private void replacePredecessors(ProjectContext ctx, Task task, List<Long> requested) {
        Set<Long> ids = new HashSet<>(requested);
        Long projectId = task.getProjectId();
        if (ids.contains(task.getId())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "任务不能依赖自己");
        }
        ProjectTaskSnapshot snap = snapshot(ctx);
        for (Long id : ids) {
            Task pre = snap.byId.get(id);
            if (pre == null) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "前置任务不存在，或不在这个项目里");
            }
        }
        // 去掉旧的前置之后，新前置不能是这个任务的下游（否则成环）
        Map<Long, List<Long>> next = new HashMap<>();
        snap.succs.forEach((k, v) -> next.put(k, new ArrayList<>(v)));
        for (Long oldPre : snap.preds.getOrDefault(task.getId(), List.of())) {
            next.getOrDefault(oldPre, new ArrayList<>()).remove(task.getId());
        }
        for (Long id : ids) {
            if (DependencyGraph.reaches(next, task.getId(), id)) {
                throw new BusinessException(ResultCode.CONFLICT, "依赖存在环");
            }
        }
        Set<Long> old = new HashSet<>(snap.preds.getOrDefault(task.getId(), List.of()));
        dependencyMapper.deleteByNextTask(task.getId());
        for (Long id : ids) {
            TaskDependency d = new TaskDependency();
            d.setProjectId(projectId);
            d.setPreTaskId(id);
            d.setNextTaskId(task.getId());
            dependencyMapper.insert(d);
        }
        if (!old.equals(ids)) {
            String names = ids.isEmpty()
                    ? "无"
                    : ids.stream()
                            .sorted()
                            .map(id -> "T-" + snap.byId.get(id).getTaskNo())
                            .collect(Collectors.joining("、"));
            logService.record(
                    ctx.user().id(),
                    projectId,
                    TARGET_TASK,
                    task.getId(),
                    "UPDATE",
                    ctx.user().realName() + " 把前置任务改为" + names);
        }
    }

    /** 状态变化带来的字段变化：完成日、实际开始、进度 */
    private static void applyStatus(Task task, TaskStatus status, LocalDate today) {
        TaskStatus old = TaskStatus.parse(task.getStatus());
        task.setStatus(status.name());
        switch (status) {
            case TODO -> {
                task.setActualStart(null);
                task.setActualEnd(null);
                task.setProgress(0);
            }
            case DOING, BLOCKED -> {
                if (task.getActualStart() == null) task.setActualStart(today);
                task.setActualEnd(null);
                if (old == TaskStatus.DONE) task.setProgress(0);
            }
            case DONE -> {
                if (task.getActualStart() == null) task.setActualStart(today);
                if (task.getActualEnd() == null) task.setActualEnd(today);
                task.setProgress(100);
            }
        }
    }

    /** 把任务放进某一列的第 index 位，列里其他任务重排；任务自己的 sortOrder 写进实体，由调用方保存 */
    private void place(Task task, TaskStatus status, int index) {
        List<Task> column = new ArrayList<>(taskMapper.listByStatus(task.getProjectId(), status.name()));
        column.removeIf(t -> t.getId().equals(task.getId()));
        int at = Math.min(Math.max(index, 0), column.size());
        column.add(at, task);
        for (int i = 0; i < column.size(); i++) {
            Task t = column.get(i);
            if (t == task) {
                task.setSortOrder(i);
            } else if (t.getSortOrder() == null || t.getSortOrder() != i) {
                taskMapper.updateSortOrder(t.getId(), i);
            }
        }
    }

    /** 把某一列的 sort_order 重新排成 0..n-1，skipId 是刚搬走的任务 */
    private void renumber(Long projectId, String status, Long skipId) {
        List<Task> column = taskMapper.listByStatus(projectId, status);
        int i = 0;
        for (Task t : column) {
            if (t.getId().equals(skipId)) continue;
            if (t.getSortOrder() == null || t.getSortOrder() != i) {
                taskMapper.updateSortOrder(t.getId(), i);
            }
            i++;
        }
    }

    private void requireMember(Long projectId, Long userId) {
        if (userId != null && memberMapper.find(projectId, userId) == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "负责人必须是项目成员");
        }
    }

    private void requireParent(Long projectId, Long parentId, Long selfId) {
        if (parentId == null) {
            return;
        }
        Task parent = taskMapper.findById(parentId);
        if (parent == null || !parent.getProjectId().equals(projectId)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "父任务不存在，或不在这个项目里");
        }
        if (parentId.equals(selfId)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "任务不能是自己的子任务");
        }
    }

    private static void checkDates(LocalDate planStart, LocalDate dueDate) {
        if (planStart != null && dueDate != null && dueDate.isBefore(planStart)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "截止日期不能早于计划开始");
        }
    }

    private Task load(Long taskId) {
        Task task = taskMapper.findById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "任务不存在");
        }
        return task;
    }

    private TaskDetailVO reload(ProjectContext ctx, Long taskId) {
        ProjectTaskSnapshot snap = snapshot(ctx);
        return detail(snap.byId.get(taskId), snap);
    }

    /** 有“编辑任务”权限的看全部，其他人看自己负责的和关键路径上的 */
    private boolean visible(ProjectContext ctx, ProjectTaskSnapshot snap, Task task) {
        return ctx.can(ProjectPerm.EDIT_TASK)
                || snap.critical.get(task.getId())
                || ctx.user().id().equals(task.getAssigneeId());
    }

    private static boolean isDone(Task t) {
        return TaskStatus.DONE.name().equals(t.getStatus());
    }

    private static UserBriefVO assignee(Task t) {
        return t.getAssigneeId() == null
                ? null
                : new UserBriefVO(t.getAssigneeId(), t.getAssigneeUsername(), t.getAssigneeRealName());
    }

    private TaskCardVO card(Task t, ProjectTaskSnapshot snap) {
        PriorityCalculator.Priority p = snap.priorityOf(t.getId());
        return new TaskCardVO(
                t.getId(),
                t.getTaskNo(),
                t.getTitle(),
                t.getStatus(),
                assignee(t),
                t.getDueDate(),
                t.getProgress(),
                new PriorityVO(p.label(), p.score()),
                snap.critical.get(t.getId()),
                WorkdayCalendar.overdueDays(t.getDueDate(), snap.today, isDone(t)),
                t.getSortOrder(),
                t.getParentId(),
                null,
                t.getActualEnd());
    }

    private List<DependencyTaskVO> dependencies(
            ProjectTaskSnapshot snap, List<Long> otherIds, Long taskId, boolean asPredecessors) {
        List<DependencyTaskVO> result = new ArrayList<>();
        for (Long otherId : otherIds) {
            Task other = snap.byId.get(otherId);
            for (TaskDependency d : snap.deps) {
                boolean match = asPredecessors
                        ? d.getPreTaskId().equals(otherId) && d.getNextTaskId().equals(taskId)
                        : d.getPreTaskId().equals(taskId) && d.getNextTaskId().equals(otherId);
                if (match) {
                    result.add(
                            new DependencyTaskVO(d.getId(), TaskRefVO.of(other), assignee(other), other.getStatus()));
                    break;
                }
            }
        }
        return result;
    }

    private TaskDetailVO detail(Task t, ProjectTaskSnapshot snap) {
        TaskCardVO c = card(t, snap);
        int used;
        if (isDone(t)) {
            used = t.getPlanDays();
        } else if (TaskStatus.TODO.name().equals(t.getStatus()) || t.getPlanStart() == null) {
            used = 0;
        } else {
            used = WorkdayCalendar.countWorkdays(t.getPlanStart(), snap.today);
        }
        Task parent = t.getParentId() == null ? null : snap.byId.get(t.getParentId());
        List<TaskCardVO> subtasks = snap.tasks.stream()
                .filter(s -> t.getId().equals(s.getParentId()))
                .map(s -> card(s, snap))
                .toList();
        return new TaskDetailVO(
                c.id(),
                c.taskNo(),
                c.title(),
                c.status(),
                c.assignee(),
                c.dueDate(),
                c.progress(),
                c.priority(),
                c.critical(),
                c.overdueDays(),
                c.sortOrder(),
                c.parentId(),
                null,
                c.actualEnd(),
                t.getProjectId(),
                t.getDescription(),
                new UserBriefVO(t.getCreatorId(), t.getCreatorUsername(), t.getCreatorRealName()),
                t.getImportance(),
                t.getUrgency(),
                t.getPlanDays(),
                used,
                t.getEstHours(),
                t.getRequiredSkills() == null ? List.of() : t.getRequiredSkills(),
                t.getPlanStart(),
                t.getActualStart(),
                TaskRefVO.of(parent),
                null,
                dependencies(snap, snap.preds.getOrDefault(t.getId(), List.of()), t.getId(), true),
                dependencies(snap, snap.succs.getOrDefault(t.getId(), List.of()), t.getId(), false),
                subtasks,
                List.of(),
                List.of(),
                t.getCreatedAt(),
                t.getUpdatedAt());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
