package org.miniteam.pms.task.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.task.entity.TaskDependency;

@Mapper
public interface DependencyMapper {

    List<TaskDependency> listByProject(@Param("projectId") Long projectId);

    void insert(TaskDependency dependency);

    /** 删掉某个任务的全部前置依赖 */
    void deleteByNextTask(@Param("nextTaskId") Long nextTaskId);
}
