package org.miniteam.pms.project.service;

import java.util.List;
import org.miniteam.pms.project.ProjectAccess;
import org.miniteam.pms.project.dto.ActivityVO;
import org.miniteam.pms.system.service.OperationLogService;
import org.springframework.stereotype.Service;

/** 项目动态：协作页动态栏、成员页的权限变更记录。项目成员（和系统管理员）可看。 */
@Service
public class ActivityService {

    private final ProjectAccess access;
    private final OperationLogService logService;

    public ActivityService(ProjectAccess access, OperationLogService logService) {
        this.access = access;
        this.logService = logService;
    }

    public List<ActivityVO> list(Long projectId, String targetType, Long targetId, Long before, int limit) {
        access.require(projectId);
        return logService.listByProject(projectId, targetType, targetId, before, limit).stream()
                .map(ActivityVO::of)
                .toList();
    }
}
