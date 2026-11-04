package org.miniteam.pms.report.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.mapper.MemberMapper;
import org.miniteam.pms.report.dto.WorkloadVO;
import org.miniteam.pms.task.entity.WorkloadRow;
import org.miniteam.pms.task.mapper.TaskMapper;
import org.miniteam.pms.user.dto.UserBriefVO;
import org.springframework.stereotype.Service;

/** 成员负载：每个成员未完成任务的预估工时、任务数，是否超过每周工时上限。项目成员（和系统管理员）可看。 */
@Service
public class WorkloadService {

    private final MemberMapper memberMapper;
    private final TaskMapper taskMapper;
    private final ProjectAccess access;

    public WorkloadService(MemberMapper memberMapper, TaskMapper taskMapper, ProjectAccess access) {
        this.memberMapper = memberMapper;
        this.taskMapper = taskMapper;
        this.access = access;
    }

    /** 成员 id → 未完成任务汇总，没有任务的成员不在里面 */
    public static Map<Long, WorkloadRow> byUser(TaskMapper taskMapper, Long projectId) {
        Map<Long, WorkloadRow> map = new HashMap<>();
        taskMapper.workloadByProject(projectId).forEach(r -> map.put(r.getUserId(), r));
        return map;
    }

    public WorkloadVO get(Long projectId) {
        access.require(projectId);
        Map<Long, WorkloadRow> stats = byUser(taskMapper, projectId);
        List<WorkloadVO.Member> members = memberMapper.listByProject(projectId).stream()
                .map(m -> {
                    WorkloadRow r = stats.get(m.getUserId());
                    double load = r == null ? 0 : r.getLoadHours();
                    int capacity = m.getWeeklyCapacity() == null ? 0 : m.getWeeklyCapacity();
                    return new WorkloadVO.Member(
                            new UserBriefVO(m.getUserId(), m.getUsername(), m.getRealName()),
                            load,
                            load,
                            capacity,
                            r == null ? 0 : r.getTaskCount(),
                            load > capacity);
                })
                .toList();
        double mean = members.stream()
                .mapToDouble(WorkloadVO.Member::loadHours)
                .average()
                .orElse(0);
        double variance = members.stream()
                .mapToDouble(m -> Math.pow(m.loadHours() - mean, 2))
                .average()
                .orElse(0);
        return new WorkloadVO(members, Math.round(variance * 100) / 100.0);
    }
}
