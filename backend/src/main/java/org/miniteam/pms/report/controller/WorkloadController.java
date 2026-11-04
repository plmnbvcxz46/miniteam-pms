package org.miniteam.pms.report.controller;

import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.report.dto.WorkloadVO;
import org.miniteam.pms.report.service.WorkloadService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WorkloadController {

    private final WorkloadService workloadService;

    public WorkloadController(WorkloadService workloadService) {
        this.workloadService = workloadService;
    }

    @GetMapping("/projects/{projectId}/workload")
    public Result<WorkloadVO> workload(@PathVariable Long projectId) {
        return Result.ok(workloadService.get(projectId));
    }
}
