package org.miniteam.pms.system.mapper;

import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.system.entity.LogRow;

@Mapper
public interface OperationLogMapper {

    void insert(
            @Param("userId") Long userId,
            @Param("projectId") Long projectId,
            @Param("targetType") String targetType,
            @Param("targetId") Long targetId,
            @Param("action") String action,
            @Param("detail") String detail,
            @Param("ip") String ip);

    List<LogRow> list(
            @Param("userId") Long userId,
            @Param("projectId") Long projectId,
            @Param("targetType") String targetType,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("offset") int offset,
            @Param("size") int size);

    /** 项目动态：按 ID 倒序，before 不为空时只取比它更早的 */
    List<LogRow> listByProject(
            @Param("projectId") Long projectId,
            @Param("targetType") String targetType,
            @Param("targetId") Long targetId,
            @Param("before") Long before,
            @Param("limit") int limit);

    long count(
            @Param("userId") Long userId,
            @Param("projectId") Long projectId,
            @Param("targetType") String targetType,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
