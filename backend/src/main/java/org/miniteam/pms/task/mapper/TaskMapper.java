package org.miniteam.pms.task.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.task.entity.Task;
import org.miniteam.pms.task.entity.WorkloadRow;

@Mapper
public interface TaskMapper {

    Task findById(@Param("id") Long id);

    /** 项目里的全部任务，按看板顺序（状态内按 sort_order） */
    List<Task> listByProject(@Param("projectId") Long projectId);

    /** 某一列的任务，按 sort_order、id */
    List<Task> listByStatus(@Param("projectId") Long projectId, @Param("status") String status);

    /** 锁住项目行，串行化同一项目里生成编号和重排看板列 */
    Long lockProject(@Param("projectId") Long projectId);

    int maxTaskNo(@Param("projectId") Long projectId);

    void insert(Task task);

    /** 更新任务的可编辑字段（标题、描述、负责人、重要度、工期、日期等），不含状态和排序 */
    void update(Task task);

    /** 更新状态、进度、实际起止和排序 */
    void updateStatus(Task task);

    void updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);

    void delete(@Param("id") Long id);

    /** 每个成员未完成任务的预估工时之和与任务数 */
    List<WorkloadRow> workloadByProject(@Param("projectId") Long projectId);
}
