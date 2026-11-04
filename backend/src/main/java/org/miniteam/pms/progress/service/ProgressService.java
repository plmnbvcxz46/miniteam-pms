package org.miniteam.pms.progress.service;

import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.progress.ProgressCalculator;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.progress.dto.CriticalPathVO;
import org.miniteam.pms.progress.dto.GanttVO;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.progress.dto.PriorityItemVO;
import org.miniteam.pms.progress.dto.TodoItemVO;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.springframework.stereotype.Service;

/** 甘特图、关键路径、总览、今日待办、优先级排名。项目成员（和系统管理员）可看，看得到的任务范围同任务列表。 */
@Service
public class ProgressService {

    private final ProjectAccess access;
    private final ProjectDataLoader loader;

    public ProgressService(ProjectAccess access, ProjectDataLoader loader) {
        this.access = access;
        this.loader = loader;
    }

    public GanttVO gantt(Long projectId, LocalDate from, LocalDate to) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "结束日期不能早于开始日期");
        }
        ProjectContext ctx = access.require(projectId);
        return ProgressCalculator.gantt(loader.load(ctx.project()), ProjectDataLoader.viewer(ctx), from, to);
    }

    public CriticalPathVO criticalPath(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        return ProgressCalculator.criticalPath(loader.load(ctx.project()), ProjectDataLoader.viewer(ctx));
    }

    public OverviewVO overview(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        return ProgressCalculator.overview(loader.load(ctx.project()), ProjectDataLoader.viewer(ctx), loader.topN());
    }

    /** limit 为空取系统参数 priority.top_n */
    public List<TodoItemVO> todo(Long projectId, Integer limit) {
        if (limit != null && limit < 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "limit 不能是负数");
        }
        ProjectContext ctx = access.require(projectId);
        ProjectData data = loader.load(ctx.project());
        Viewer viewer = ProjectDataLoader.viewer(ctx);
        int n = limit == null ? loader.topN() : limit;
        return ProgressCalculator.todo(data, viewer).stream().limit(n).toList();
    }

    public List<PriorityItemVO> priorityRanking(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        return ProgressCalculator.priorityRanking(loader.load(ctx.project()), ProjectDataLoader.viewer(ctx));
    }
}
