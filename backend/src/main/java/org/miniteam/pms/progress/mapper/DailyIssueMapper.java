package org.miniteam.pms.progress.mapper;

import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.progress.entity.DailyIssue;

@Mapper
public interface DailyIssueMapper {

    /** 项目已存档的期，不含 snapshot（列表只要头条和预测） */
    List<DailyIssue> listByProject(@Param("projectId") Long projectId);

    /** 某一期，含 snapshot；没存档返回 null */
    DailyIssue find(@Param("projectId") Long projectId, @Param("issueDate") LocalDate issueDate);

    int count(@Param("projectId") Long projectId, @Param("issueDate") LocalDate issueDate);

    /** 同一项目同一天已有就覆盖 */
    void upsert(DailyIssue issue);
}
