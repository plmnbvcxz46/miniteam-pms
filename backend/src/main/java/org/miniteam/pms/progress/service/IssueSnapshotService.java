package org.miniteam.pms.progress.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.document.DocumentViews;
import org.miniteam.pms.document.entity.DocumentWithVersions;
import org.miniteam.pms.document.service.DocumentService;
import org.miniteam.pms.progress.ProgressCalculator;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.progress.dto.IssueSnapshotVO;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.progress.dto.PastMemberVO;
import org.miniteam.pms.progress.entity.DailyIssue;
import org.miniteam.pms.progress.mapper.DailyIssueMapper;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.dto.IssueSummaryVO;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.miniteam.pms.report.ReportCalculator;
import org.miniteam.pms.report.dto.ReportsVO;
import org.miniteam.pms.report.dto.WorkloadVO;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.dto.TaskDetailVO;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.entity.TaskDependency;
import org.miniteam.pms.task.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * 往期日报：每天零点给每个还在进行的项目存一份“昨天结束时”的任务、依赖、成员，
 * 读往期时用同一套计算类、按这份数据和那一天的日期重新算出各页面的数据，再按调用人的权限过滤。
 * 项目当前所在的那一天（今天，已归档的停在结束日期）不用存档，直接按实时数据算。
 */
@Service
public class IssueSnapshotService {

    private static final Logger log = LoggerFactory.getLogger(IssueSnapshotService.class);
    private static final JsonMapper MAPPER = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
    /** 生成头条、预测时用：看全部任务 */
    private static final Viewer EVERYTHING = new Viewer(0L, true);

    /** 存进 daily_issue.snapshot 的内容：原始数据，不含各页面算好的结果 */
    public record StoredState(
            List<Task> tasks,
            List<TaskDependency> dependencies,
            List<ProjectMember> members,
            List<DocumentWithVersions> documents) {

        /** 旧存档没有文档这一项，按没有文档算 */
        public List<DocumentWithVersions> documentsOrEmpty() {
            return documents == null ? List.of() : documents;
        }
    }

    private final ProjectAccess access;
    private final ProjectMapper projectMapper;
    private final DailyIssueMapper issueMapper;
    private final ProjectDataLoader loader;
    private final TaskService taskService;
    private final DocumentService documentService;

    public IssueSnapshotService(
            ProjectAccess access,
            ProjectMapper projectMapper,
            DailyIssueMapper issueMapper,
            ProjectDataLoader loader,
            TaskService taskService,
            DocumentService documentService) {
        this.access = access;
        this.projectMapper = projectMapper;
        this.issueMapper = issueMapper;
        this.loader = loader;
        this.taskService = taskService;
        this.documentService = documentService;
    }

    public static String encode(StoredState state) {
        return MAPPER.writeValueAsString(state);
    }

    public static StoredState decode(String json) {
        return MAPPER.readValue(json, StoredState.class);
    }

    // ---------- 生成 ----------

    /** 存下 date 这一天结束时的状态，同一天已有就覆盖 */
    public void generate(Project project, LocalDate date) {
        ProjectData data = loader.load(project, date);
        OverviewVO.Headline headline =
                ProgressCalculator.overview(data, EVERYTHING, 0).headline();
        DailyIssue issue = new DailyIssue();
        issue.setProjectId(project.getId());
        issue.setIssueDate(date);
        issue.setIssueNo(IssueCalendar.issueNo(project.getStartDate(), date));
        issue.setHeadline(headline.title());
        issue.setPredictedEnd(headline.predictedEnd());
        issue.setDelayDays(headline.delayDays());
        issue.setSnapshot(MAPPER.writeValueAsString(new StoredState(
                data.snap().tasks, data.snap().deps, data.members(), documentService.loadAll(project.getId()))));
        issueMapper.upsert(issue);
    }

    /** 每天零点给所有还在进行的项目存昨天那一期 */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Shanghai")
    public void generateYesterday() {
        LocalDate yesterday = IssueCalendar.today().minusDays(1);
        for (Project project : projectMapper.listForSnapshot(yesterday)) {
            try {
                generate(project, yesterday);
            } catch (RuntimeException e) {
                log.error("生成往期快照失败：项目 {} 日期 {}", project.getId(), yesterday, e);
            }
        }
    }

    /** 启动时补一次：昨天那一期没有存档的补上（服务昨天零点没开着的兜底，存的是此刻的状态） */
    @EventListener(ApplicationReadyEvent.class)
    public void catchUp() {
        LocalDate yesterday = IssueCalendar.today().minusDays(1);
        try {
            for (Project project : projectMapper.listForSnapshot(yesterday)) {
                if (issueMapper.count(project.getId(), yesterday) == 0) {
                    generate(project, yesterday);
                }
            }
        } catch (RuntimeException e) {
            log.error("补生成往期快照失败", e);
        }
    }

    // ---------- 读 ----------

    /** 往期列表，最近一期在前：存过档的用存档里的头条和预测，当前这一期用实时数据 */
    public List<IssueSummaryVO> list(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        Project project = ctx.project();
        LocalDate current = currentDate(project);
        Map<LocalDate, DailyIssue> stored = new LinkedHashMap<>();
        issueMapper.listByProject(projectId).forEach(i -> stored.put(i.getIssueDate(), i));
        List<IssueSummaryVO> list = new ArrayList<>();
        for (IssueSummaryVO base : IssueCalendar.issues(project.getStartDate(), current)) {
            if (base.issueDate().equals(current)) {
                list.add(liveSummary(base, loader.load(project)));
                continue;
            }
            DailyIssue row = stored.get(base.issueDate());
            list.add(
                    row == null
                            ? base
                            : new IssueSummaryVO(
                                    base.issueNo(),
                                    base.issueDate(),
                                    row.getHeadline(),
                                    row.getPredictedEnd(),
                                    row.getDelayDays(),
                                    row.getDelayDays() > 0));
        }
        return list;
    }

    /** 某一期。当前这一期按实时数据算，过去的期按存档算，没存档 404，日期不在项目里 404。 */
    public IssueSnapshotVO get(Long projectId, LocalDate issueDate) {
        ProjectContext ctx = access.require(projectId);
        Project project = ctx.project();
        LocalDate current = currentDate(project);
        if (issueDate.isBefore(project.getStartDate()) || issueDate.isAfter(current)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "没有这一期");
        }
        ProjectData data;
        List<DocumentWithVersions> docs;
        IssueSummaryVO summary;
        IssueSummaryVO base = new IssueSummaryVO(
                IssueCalendar.issueNo(project.getStartDate(), issueDate), issueDate, null, null, 0, false);
        if (issueDate.equals(current)) {
            data = loader.load(project);
            docs = documentService.loadAll(projectId);
            summary = liveSummary(base, data);
        } else {
            DailyIssue row = issueMapper.find(projectId, issueDate);
            if (row == null) {
                throw new BusinessException(ResultCode.NOT_FOUND, "这一期没有存档");
            }
            StoredState state = decode(row.getSnapshot());
            data = fromStored(project, issueDate, state);
            docs = DocumentViews.asOf(state.documentsOrEmpty(), issueDate);
            summary = new IssueSummaryVO(
                    base.issueNo(),
                    issueDate,
                    row.getHeadline(),
                    row.getPredictedEnd(),
                    row.getDelayDays(),
                    row.getDelayDays() > 0);
        }
        return new IssueSnapshotVO(
                summary.issueNo(),
                summary.issueDate(),
                summary.headline(),
                summary.predictedEnd(),
                summary.delayDays(),
                summary.risk(),
                pages(data, ProjectDataLoader.viewer(ctx), docs));
    }

    /** 各页面当天的数据，键见 {@link IssueSnapshotVO}。讨论还没有后端，先给空数组 */
    private Map<String, Object> pages(ProjectData data, Viewer viewer, List<DocumentWithVersions> docs) {
        ReportsVO reports = ReportCalculator.build(data, viewer);
        Map<String, Object> pages = new LinkedHashMap<>();
        List<TaskDetailVO> tasks = taskService.visibleDetails(
                data.snap(),
                viewer.canEditTask(),
                viewer.userId(),
                DocumentViews.briefsByTask(
                        docs.stream().map(DocumentWithVersions::document).toList(), data.snap().byId, data.today()));
        pages.put("tasks", tasks);
        pages.put("overview", ProgressCalculator.overview(data, viewer, loader.topN()));
        pages.put("gantt", ProgressCalculator.gantt(data, viewer, null, null));
        pages.put("criticalPath", ProgressCalculator.criticalPath(data, viewer));
        pages.put("reports", reports);
        pages.put("members", pastMembers(data, reports.workload()));
        pages.put("discussions", List.of());
        pages.put(
                "documents",
                docs.stream()
                        .map(d -> DocumentViews.detail(d, data.snap().byId, data.today()))
                        .toList());
        return pages;
    }

    private static List<PastMemberVO> pastMembers(ProjectData data, WorkloadVO workload) {
        LocalDate today = data.today();
        List<PastMemberVO> list = new ArrayList<>();
        for (ProjectMember m : data.members()) {
            if (m.getJoinedAt() != null && m.getJoinedAt().toLocalDate().isAfter(today)) {
                continue;
            }
            WorkloadVO.Member w = workload.members().stream()
                    .filter(x -> x.user().id().equals(m.getUserId()))
                    .findFirst()
                    .orElseThrow();
            list.add(new PastMemberVO(
                    w.user(), m.getJoinedAt(), w.capacity(), w.weeklyHours(), w.taskCount(), w.overCapacity()));
        }
        return list;
    }

    private ProjectData fromStored(Project project, LocalDate date, StoredState state) {
        ProjectTaskSnapshot snap = new ProjectTaskSnapshot(date, state.tasks(), state.dependencies(), loader.configs());
        return new ProjectData(project.getStartDate(), project.getPlanEnd(), snap, state.members());
    }

    private static IssueSummaryVO liveSummary(IssueSummaryVO base, ProjectData data) {
        OverviewVO.Headline h = ProgressCalculator.overview(data, EVERYTHING, 0).headline();
        return new IssueSummaryVO(
                base.issueNo(), base.issueDate(), h.title(), h.predictedEnd(), h.delayDays(), h.delayDays() > 0);
    }

    private static LocalDate currentDate(Project p) {
        return IssueCalendar.effectiveDate(p.getStartDate(), p.getActualEnd(), IssueCalendar.today());
    }
}
