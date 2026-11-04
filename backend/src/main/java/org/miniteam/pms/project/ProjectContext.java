package org.miniteam.pms.project;

import org.miniteam.pms.auth.LoginUser;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.entity.ProjectMember;

/**
 * 当前用户在某个项目里的身份：项目、登录用户，以及成员记录（系统管理员不是成员时为空）。
 * 由 {@link ProjectAccess#require} 得到，之后各模块的 Service 用它判断权限。
 */
public record ProjectContext(Project project, LoginUser user, ProjectMember member) {

    public static final String ARCHIVED = "ARCHIVED";

    /** 在项目里的角色，系统管理员不是成员时为空 */
    public String myRole() {
        return member == null ? null : member.getProjectRole();
    }

    /** 项目经理或系统管理员 */
    public boolean isPm() {
        return user.isAdmin() || ProjectRole.PM.name().equals(myRole());
    }

    /** 系统管理员所有权限都有 */
    public boolean can(ProjectPerm perm) {
        if (user.isAdmin()) {
            return true;
        }
        if (member == null) {
            return false;
        }
        return switch (perm) {
            case EDIT_TASK -> member.isCanEditTask();
            case EDIT_SCHEDULE -> member.isCanEditSchedule();
            case EDIT_DOC -> member.isCanEditDoc();
            case MANAGE_MEMBER -> member.isCanManageMember();
        };
    }

    public boolean isArchived() {
        return ARCHIVED.equals(project.getStatus());
    }

    public void requirePm() {
        if (!isPm()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有项目经理可以这样做");
        }
    }

    public void requirePermission(ProjectPerm perm) {
        if (!can(perm)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "没有「" + perm.label() + "」权限");
        }
    }

    /** 已归档的项目只读 */
    public void requireWritable() {
        if (isArchived()) {
            throw new BusinessException(ResultCode.CONFLICT, "项目已归档，不能修改");
        }
    }
}
