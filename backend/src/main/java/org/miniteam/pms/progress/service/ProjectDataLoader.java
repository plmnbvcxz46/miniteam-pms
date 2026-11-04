package org.miniteam.pms.progress.service;

import java.time.LocalDate;
import java.util.Map;
import java.util.stream.Collectors;
import org.miniteam.pms.progress.ProjectData;
import org.miniteam.pms.progress.Viewer;
import org.miniteam.pms.project.IssueCalendar;
import org.miniteam.pms.project.ProjectContext;
import org.miniteam.pms.project.ProjectPerm;
import org.miniteam.pms.project.entity.Project;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.system.mapper.ConfigMapper;
import org.miniteam.pms.task.ProjectTaskSnapshot;
import org.miniteam.pms.task.mapper.DependencyMapper;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.springframework.stereotype.Component;

/** 从数据库读出项目当前的任务、依赖、成员，交给进度和报表的计算类。 */
@Component
public class ProjectDataLoader {

    private static final int DEFAULT_TOP_N = 5;

    private final TaskMapper taskMapper;
    private final DependencyMapper dependencyMapper;
    private final MemberMapper memberMapper;
    private final ConfigMapper configMapper;

    public ProjectDataLoader(
            TaskMapper taskMapper,
            DependencyMapper dependencyMapper,
            MemberMapper memberMapper,
            ConfigMapper configMapper) {
        this.taskMapper = taskMapper;
        this.dependencyMapper = dependencyMapper;
        this.memberMapper = memberMapper;
        this.configMapper = configMapper;
    }

    public Map<String, String> configs() {
        return configMapper.listAll().stream()
                .collect(Collectors.toMap(c -> c.getConfigKey(), c -> c.getConfigValue(), (a, b) -> a));
    }

    /** 项目现在的样子，“今天”取项目当前所在的那一天（已归档的停在结束日期） */
    public ProjectData load(Project project) {
        LocalDate today =
                IssueCalendar.effectiveDate(project.getStartDate(), project.getActualEnd(), IssueCalendar.today());
        return load(project, today);
    }

    /** 当前数据，但“今天”指定为某一天（生成往期快照时用） */
    public ProjectData load(Project project, LocalDate today) {
        ProjectTaskSnapshot snap = new ProjectTaskSnapshot(
                today,
                taskMapper.listByProject(project.getId()),
                dependencyMapper.listByProject(project.getId()),
                configs());
        return new ProjectData(
                project.getStartDate(), project.getPlanEnd(), snap, memberMapper.listByProject(project.getId()));
    }

    public static Viewer viewer(ProjectContext ctx) {
        return new Viewer(ctx.user().id(), ctx.can(ProjectPerm.EDIT_TASK));
    }

    /** 今日待办取几条，系统参数 priority.top_n */
    public int topN() {
        String raw = configs().get("priority.top_n");
        try {
            return raw == null ? DEFAULT_TOP_N : Math.max(0, Integer.parseInt(raw.trim()));
        } catch (NumberFormatException e) {
            return DEFAULT_TOP_N;
        }
    }
}
