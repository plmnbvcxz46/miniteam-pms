package org.miniteam.pms.project;

import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.auth.LoginUser;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.project.mapper.ProjectMapper;
import org.springframework.stereotype.Component;

/**
 * 项目内的权限入口。每个带 projectId 的接口，Service 第一步先调 {@link #require}：
 * 项目不存在 404，不是成员且不是系统管理员 403。后面的任务、文档、讨论等模块都走这里。
 */
@Component
public class ProjectAccess {

    private final ProjectMapper projectMapper;
    private final MemberMapper memberMapper;

    public ProjectAccess(ProjectMapper projectMapper, MemberMapper memberMapper) {
        this.projectMapper = projectMapper;
        this.memberMapper = memberMapper;
    }

    public ProjectContext require(Long projectId) {
        LoginUser user = AuthContext.require();
        Project project = projectMapper.findById(projectId, user.id());
        if (project == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "项目不存在");
        }
        ProjectMember member = memberMapper.find(projectId, user.id());
        if (member == null && !user.isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN, "你不是这个项目的成员");
        }
        return new ProjectContext(project, user, member);
    }
}
