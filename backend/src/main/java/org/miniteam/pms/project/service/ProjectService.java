package org.miniteam.pms.project.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.auth.LoginUser;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.ProjectPerm;
import org.miniteam.pms.project.ProjectRole;
import org.miniteam.pms.project.dto.IssueSummaryVO;
import org.miniteam.pms.project.dto.PermissionsVO;
import org.miniteam.pms.project.dto.ProjectSave;
import org.miniteam.pms.project.dto.ProjectSummaryVO;
import org.miniteam.pms.project.dto.ProjectVO;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 项目的增删改查、归档和期列表。 */
@Service
public class ProjectService {

    private static final String TARGET_PROJECT = "PROJECT";
    private static final int MAX_DAYS = 3650;

    private final ProjectMapper projectMapper;
    private final MemberMapper memberMapper;
    private final ProjectAccess access;
    private final OperationLogService logService;

    public ProjectService(
            ProjectMapper projectMapper,
            MemberMapper memberMapper,
            ProjectAccess access,
            OperationLogService logService) {
        this.projectMapper = projectMapper;
        this.memberMapper = memberMapper;
        this.access = access;
        this.logService = logService;
    }

    /** 系统管理员看全部，其他人只看自己加入的 */
    public List<ProjectSummaryVO> list(String status) {
        LoginUser user = AuthContext.require();
        if (status != null && !status.isBlank() && !"ACTIVE".equals(status) && !"ARCHIVED".equals(status)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "项目状态不正确");
        }
        LocalDate today = IssueCalendar.today();
        return projectMapper.list(user.id(), user.isAdmin(), status).stream()
                .map(p -> toSummary(p, today))
                .toList();
    }

    @Transactional
    public ProjectVO create(ProjectSave request) {
        LoginUser user = AuthContext.require();
        checkDates(request.startDate(), request.planEnd());
        Project project = new Project();
        project.setName(request.name().trim());
        project.setDescription(blankToNull(request.description()));
        project.setOwnerId(user.id());
        project.setStatus("ACTIVE");
        project.setStartDate(request.startDate());
        project.setPlanEnd(request.planEnd());
        projectMapper.insert(project);

        ProjectMember pm = new ProjectMember();
        pm.setProjectId(project.getId());
        pm.setUserId(user.id());
        pm.setProjectRole(ProjectRole.PM.name());
        pm.setPosition(ProjectRole.PM.label());
        MemberService.applyDefaultPermissions(pm, ProjectRole.PM);
        memberMapper.insert(pm);

        logService.record(
                user.id(), project.getId(), TARGET_PROJECT, project.getId(), "CREATE", user.realName() + " 创建项目");
        return toDetail(access.require(project.getId()));
    }

    public ProjectVO get(Long projectId) {
        return toDetail(access.require(projectId));
    }

    @Transactional
    public ProjectVO update(Long projectId, ProjectSave request) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePm();
        ctx.requireWritable();
        checkDates(request.startDate(), request.planEnd());
        projectMapper.update(
                projectId,
                request.name().trim(),
                blankToNull(request.description()),
                request.startDate(),
                request.planEnd());
        logService.record(
                ctx.user().id(),
                projectId,
                TARGET_PROJECT,
                projectId,
                "UPDATE",
                ctx.user().realName() + " 修改了项目信息");
        return toDetail(access.require(projectId));
    }

    @Transactional
    public void archive(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePm();
        ctx.requireWritable();
        projectMapper.archive(projectId, IssueCalendar.today());
        logService.record(
                ctx.user().id(),
                projectId,
                TARGET_PROJECT,
                projectId,
                "ARCHIVE",
                ctx.user().realName() + " 归档了项目");
    }

    /** 往期列表，最近一期在前。快照要等任务模块，这里只给期号和日期。 */
    public List<IssueSummaryVO> issues(Long projectId) {
        Project project = access.require(projectId).project();
        LocalDate date = effectiveDate(project, IssueCalendar.today());
        return IssueCalendar.issues(project.getStartDate(), date);
    }

    private ProjectSummaryVO toSummary(Project p, LocalDate today) {
        int issueNo = IssueCalendar.issueNo(p.getStartDate(), effectiveDate(p, today));
        return new ProjectSummaryVO(
                p.getId(), p.getName(), p.getStatus(), p.getStartDate(), p.getPlanEnd(), issueNo, null, p.getMyRole());
    }

    private ProjectVO toDetail(ProjectContext ctx) {
        Project p = ctx.project();
        LocalDate date = effectiveDate(p, IssueCalendar.today());
        PermissionsVO permissions = new PermissionsVO(
                ctx.can(ProjectPerm.EDIT_TASK),
                ctx.can(ProjectPerm.EDIT_SCHEDULE),
                ctx.can(ProjectPerm.EDIT_DOC),
                ctx.can(ProjectPerm.MANAGE_MEMBER));
        return new ProjectVO(
                p.getId(),
                p.getName(),
                p.getDescription(),
                new UserBriefVO(p.getOwnerId(), p.getOwnerUsername(), p.getOwnerRealName()),
                p.getStatus(),
                p.getStartDate(),
                p.getPlanEnd(),
                p.getActualEnd(),
                IssueCalendar.issueNo(p.getStartDate(), date),
                IssueCalendar.totalWeeks(p.getStartDate(), p.getPlanEnd()),
                IssueCalendar.currentWeek(p.getStartDate(), date),
                ctx.myRole(),
                permissions,
                p.getCreatedAt());
    }

    private static LocalDate effectiveDate(Project p, LocalDate today) {
        return IssueCalendar.effectiveDate(p.getStartDate(), p.getActualEnd(), today);
    }

    private static void checkDates(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "计划结束日期不能早于开始日期");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_DAYS) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "项目时间跨度不能超过 10 年");
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
