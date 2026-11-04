package org.miniteam.pms.progress;

import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.project.entity.ProjectMember;
import org.miniteam.pms.task.ProjectTaskSnapshot;

/**
 * 进度和报表计算的输入：项目起止日期、某一天的任务快照、当时的成员。
 * 实时数据和往期快照里存下来的数据都用它交给计算类，计算类不碰数据库。
 */
public record ProjectData(
        LocalDate startDate, LocalDate planEnd, ProjectTaskSnapshot snap, List<ProjectMember> members) {

    public LocalDate today() {
        return snap.today;
    }
}
