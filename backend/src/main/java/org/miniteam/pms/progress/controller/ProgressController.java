package org.miniteam.pms.progress.controller;

import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.progress.dto.CriticalPathVO;
import org.miniteam.pms.progress.dto.GanttVO;
import org.miniteam.pms.progress.dto.OverviewVO;
import org.miniteam.pms.progress.dto.PriorityItemVO;
import org.miniteam.pms.progress.dto.TodoItemVO;
import org.miniteam.pms.progress.service.ProgressService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    /** milestoneId 里程碑不实现，忽略 */
    @GetMapping("/projects/{projectId}/gantt")
    public Result<GanttVO> gantt(
            @PathVariable Long projectId,
            @RequestParam(required = false) Long milestoneId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return Result.ok(progressService.gantt(projectId, from, to));
    }

    @GetMapping("/projects/{projectId}/critical-path")
    public Result<CriticalPathVO> criticalPath(
            @PathVariable Long projectId, @RequestParam(required = false) Long milestoneId) {
        return Result.ok(progressService.criticalPath(projectId));
    }

    @GetMapping("/projects/{projectId}/overview")
    public Result<OverviewVO> overview(@PathVariable Long projectId) {
        return Result.ok(progressService.overview(projectId));
    }

    @GetMapping("/projects/{projectId}/todo")
    public Result<List<TodoItemVO>> todo(@PathVariable Long projectId, @RequestParam(required = false) Integer limit) {
        return Result.ok(progressService.todo(projectId, limit));
    }

    @GetMapping("/projects/{projectId}/priority-ranking")
    public Result<List<PriorityItemVO>> priorityRanking(@PathVariable Long projectId) {
        return Result.ok(progressService.priorityRanking(projectId));
    }
}
