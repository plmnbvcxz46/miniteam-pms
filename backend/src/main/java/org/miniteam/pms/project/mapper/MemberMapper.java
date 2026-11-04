package org.miniteam.pms.project.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.project.entity.ProjectMember;

@Mapper
public interface MemberMapper {

    ProjectMember find(@Param("projectId") Long projectId, @Param("userId") Long userId);

    /** 项目经理在前，其余按加入时间 */
    List<ProjectMember> listByProject(@Param("projectId") Long projectId);

    void insert(ProjectMember member);

    /** 按 projectId + userId 更新角色、岗位和四项权限 */
    void update(ProjectMember member);

    int countByRole(@Param("projectId") Long projectId, @Param("projectRole") String projectRole);
}
