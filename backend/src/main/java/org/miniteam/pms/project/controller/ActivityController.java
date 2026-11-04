package org.miniteam.pms.project.controller;

import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.project.dto.ActivityVO;
import org.miniteam.pms.project.service.ActivityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects/{projectId}/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public Result<List<ActivityVO>> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) Long before,
            @RequestParam(defaultValue = "20") int limit) {
        return Result.ok(activityService.list(projectId, targetType, targetId, before, limit));
    }
}
