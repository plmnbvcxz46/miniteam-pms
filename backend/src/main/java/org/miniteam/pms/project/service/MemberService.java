package org.miniteam.pms.project.service;

import java.util.List;
import java.util.Objects;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.ProjectPerm;
import org.miniteam.pms.project.ProjectRole;
import org.miniteam.pms.project.dto.MemberAdd;
import org.miniteam.pms.project.dto.MemberUpdate;
import org.miniteam.pms.project.dto.MemberVO;
import org.miniteam.pms.project.dto.PermissionsUpdate;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.report.service.WorkloadService;
import org.miniteam.pms.system.service.OperationLogService;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.miniteam.pms.user.entity.SysUser;
import org.miniteam.pms.user.mapper.UserMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 项目成员：列表、邀请、改角色岗位、改权限。 */
@Service
public class MemberService {

    private static final String TARGET_MEMBER = "MEMBER";

    private final MemberMapper memberMapper;
    private final TaskMapper taskMapper;
    private final UserMapper userMapper;
    private final ProjectAccess access;
    private final OperationLogService logService;

    public MemberService(
            MemberMapper memberMapper,
            TaskMapper taskMapper,
            UserMapper userMapper,
            ProjectAccess access,
            OperationLogService logService) {
        this.memberMapper = memberMapper;
        this.taskMapper = taskMapper;
        this.userMapper = userMapper;
        this.access = access;
        this.logService = logService;
    }

    /** 项目经理四项权限全开，其他人只有编辑文档 */
    static void applyDefaultPermissions(ProjectMember m, ProjectRole role) {
        boolean pm = role == ProjectRole.PM;
        m.setCanEditTask(pm);
        m.setCanEditSchedule(pm);
        m.setCanEditDoc(true);
        m.setCanManageMember(pm);
    }

    public List<MemberVO> list(Long projectId) {
        access.require(projectId);
        var load = WorkloadService.byUser(taskMapper, projectId);
        return memberMapper.listByProject(projectId).stream()
                .map(m -> MemberVO.of(m, load.get(m.getUserId())))
                .toList();
    }

    @Transactional
    public MemberVO add(Long projectId, MemberAdd request) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePermission(ProjectPerm.MANAGE_MEMBER);
        ctx.requireWritable();
        ProjectRole role =
                request.projectRole() == null ? ProjectRole.MEMBER : ProjectRole.parse(request.projectRole());
        if (role == ProjectRole.PM) {
            // 管理成员权限不能用来给人提升成项目经理
            ctx.requirePm();
        }
        SysUser user = userMapper.findById(request.userId());
        if (user == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用户不存在");
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "该账号已停用，不能邀请");
        }
        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(user.getId());
        member.setProjectRole(role.name());
        member.setPosition(blankToNull(request.position()));
        applyDefaultPermissions(member, role);
        if (role != ProjectRole.PM) {
            if (request.canEditTask() != null) member.setCanEditTask(request.canEditTask());
            if (request.canEditSchedule() != null) member.setCanEditSchedule(request.canEditSchedule());
            if (request.canEditDoc() != null) member.setCanEditDoc(request.canEditDoc());
            if (request.canManageMember() != null) member.setCanManageMember(request.canManageMember());
        }
        try {
            memberMapper.insert(member);
        } catch (DuplicateKeyException e) {
            throw new BusinessException(ResultCode.CONFLICT, "该用户已经是项目成员");
        }
        logService.record(
                ctx.user().id(),
                projectId,
                TARGET_MEMBER,
                user.getId(),
                "INVITE",
                ctx.user().realName() + " 邀请 " + user.getRealName() + " 加入项目");
        return toVO(projectId, user.getId());
    }

    @Transactional
    public MemberVO update(Long projectId, Long userId, MemberUpdate request) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePermission(ProjectPerm.MANAGE_MEMBER);
        ctx.requireWritable();
        ProjectMember target = load(projectId, userId);
        ProjectRole oldRole = ProjectRole.parse(target.getProjectRole());
        ProjectRole newRole = request.projectRole() == null ? oldRole : ProjectRole.parse(request.projectRole());
        String oldPosition = target.getPosition();

        if (newRole != oldRole) {
            if (newRole == ProjectRole.PM || oldRole == ProjectRole.PM) {
                ctx.requirePm();
            }
            if (oldRole == ProjectRole.PM && memberMapper.countByRole(projectId, ProjectRole.PM.name()) <= 1) {
                throw new BusinessException(ResultCode.CONFLICT, "项目至少要有一位项目经理");
            }
            target.setProjectRole(newRole.name());
            // 改成项目经理时权限全开；从项目经理改回去恢复默认；其他角色之间互改不动权限
            if (newRole == ProjectRole.PM || oldRole == ProjectRole.PM) {
                applyDefaultPermissions(target, newRole);
            }
        }
        if (request.position() != null) {
            target.setPosition(blankToNull(request.position()));
        }
        memberMapper.update(target);

        if (newRole != oldRole) {
            logService.record(
                    ctx.user().id(),
                    projectId,
                    TARGET_MEMBER,
                    userId,
                    "ROLE",
                    ctx.user().realName() + " 把 " + target.getRealName() + " 的角色改为" + newRole.label());
        }
        if (request.position() != null && !Objects.equals(oldPosition, target.getPosition())) {
            logService.record(
                    ctx.user().id(),
                    projectId,
                    TARGET_MEMBER,
                    userId,
                    "POSITION",
                    ctx.user().realName() + " 把 " + target.getRealName() + " 的岗位改为"
                            + (target.getPosition() == null ? "空" : target.getPosition()));
        }
        return toVO(projectId, userId);
    }

    @Transactional
    public MemberVO updatePermissions(Long projectId, Long userId, PermissionsUpdate request) {
        ProjectContext ctx = access.require(projectId);
        ctx.requirePermission(ProjectPerm.MANAGE_MEMBER);
        ctx.requireWritable();
        ProjectMember target = load(projectId, userId);
        if (ProjectRole.PM.name().equals(target.getProjectRole())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "项目经理的权限不能修改");
        }
        boolean oldTask = target.isCanEditTask();
        boolean oldSchedule = target.isCanEditSchedule();
        boolean oldDoc = target.isCanEditDoc();
        boolean oldManage = target.isCanManageMember();
        target.setCanEditTask(request.canEditTask());
        target.setCanEditSchedule(request.canEditSchedule());
        target.setCanEditDoc(request.canEditDoc());
        target.setCanManageMember(request.canManageMember());
        memberMapper.update(target);

        logChange(ctx, target, ProjectPerm.EDIT_TASK, oldTask, target.isCanEditTask());
        logChange(ctx, target, ProjectPerm.EDIT_SCHEDULE, oldSchedule, target.isCanEditSchedule());
        logChange(ctx, target, ProjectPerm.EDIT_DOC, oldDoc, target.isCanEditDoc());
        logChange(ctx, target, ProjectPerm.MANAGE_MEMBER, oldManage, target.isCanManageMember());
        return toVO(projectId, userId);
    }

    private void logChange(ProjectContext ctx, ProjectMember target, ProjectPerm perm, boolean before, boolean after) {
        if (before == after) {
            return;
        }
        logService.record(
                ctx.user().id(),
                target.getProjectId(),
                TARGET_MEMBER,
                target.getUserId(),
                after ? "GRANT" : "REVOKE",
                ctx.user().realName() + (after ? " 授予 " : " 收回 ") + target.getRealName() + " " + perm.label());
    }

    private MemberVO toVO(Long projectId, Long userId) {
        return MemberVO.of(
                memberMapper.find(projectId, userId),
                WorkloadService.byUser(taskMapper, projectId).get(userId));
    }

    private ProjectMember load(Long projectId, Long userId) {
        ProjectMember member = memberMapper.find(projectId, userId);
        if (member == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "该用户不是项目成员");
        }
        return member;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
