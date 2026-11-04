package org.miniteam.pms.project.mapper;

import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.project.entity.Project;

@Mapper
public interface ProjectMapper {

    /** userId 用来带出这个人在项目里的角色（my_role） */
    Project findById(@Param("id") Long id, @Param("userId") Long userId);

    /** all 为真时返回全部项目（系统管理员），否则只返回 userId 加入的 */
    List<Project> list(@Param("userId") Long userId, @Param("all") boolean all, @Param("status") String status);

    void insert(Project project);

    void update(
            @Param("id") Long id,
            @Param("name") String name,
            @Param("description") String description,
            @Param("startDate") LocalDate startDate,
            @Param("planEnd") LocalDate planEnd);

    void archive(@Param("id") Long id, @Param("actualEnd") LocalDate actualEnd);
}
