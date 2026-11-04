package org.miniteam.pms.report.service;

import java.util.List;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.ResultCode;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.progress.service.ProjectDataLoader;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.report.ReportCalculator;
import org.miniteam.pms.report.ReportExport;
import org.miniteam.pms.report.dto.ReportsVO;
import org.springframework.stereotype.Service;

/** 统计报表：概况、燃尽图、每周完成、工期偏差、预测完工、Excel 导出。项目成员（和系统管理员）可看，数量只算看得见的任务。 */
@Service
public class ReportService {

    private final ProjectAccess access;
    private final ProjectDataLoader loader;

    public ReportService(ProjectAccess access, ProjectDataLoader loader) {
        this.access = access;
        this.loader = loader;
    }

    /** 导出文件的内容和文件名 */
    public record Export(String fileName, byte[] content) {}

    private ReportsVO all(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        ProjectData data = loader.load(ctx.project());
        return ReportCalculator.build(data, ProjectDataLoader.viewer(ctx));
    }

    public ReportsVO.Summary summary(Long projectId) {
        return all(projectId).summary();
    }

    /** range 为 week（本周）或 all（全周期），默认 all */
    public ReportsVO.Burndown burndown(Long projectId, String range) {
        String r = range == null || range.isBlank() ? "all" : range;
        if (!r.equals("week") && !r.equals("all")) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "range 只能是 week 或 all");
        }
        ReportsVO reports = all(projectId);
        return r.equals("week") ? reports.burndownWeek() : reports.burndownAll();
    }

    public List<ReportsVO.WeeklyCompleted> weeklyCompleted(Long projectId) {
        return all(projectId).weeklyCompleted();
    }

    public List<ReportsVO.DurationDeviation> durationDeviation(Long projectId) {
        return all(projectId).deviations();
    }

    public ReportsVO.Forecast forecast(Long projectId) {
        return all(projectId).forecast();
    }

    public Export export(Long projectId) {
        ProjectContext ctx = access.require(projectId);
        ProjectData data = loader.load(ctx.project());
        Viewer viewer = ProjectDataLoader.viewer(ctx);
        ReportsVO reports = ReportCalculator.build(data, viewer);
        return new Export("统计报表_" + data.today() + ".xlsx", ReportExport.build(reports));
    }
}
