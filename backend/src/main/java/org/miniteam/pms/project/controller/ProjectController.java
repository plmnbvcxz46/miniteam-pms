package org.miniteam.pms.project.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.project.dto.ProjectSave;
import org.miniteam.pms.project.dto.ProjectSummaryVO;
import org.miniteam.pms.project.dto.ProjectVO;
import org.miniteam.pms.project.service.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public Result<List<ProjectSummaryVO>> list(@RequestParam(required = false) String status) {
        return Result.ok(projectService.list(status));
    }

    @PostMapping
    public Result<ProjectVO> create(@Valid @RequestBody ProjectSave request) {
        return Result.ok(projectService.create(request));
    }

    @GetMapping("/{projectId}")
    public Result<ProjectVO> get(@PathVariable Long projectId) {
        return Result.ok(projectService.get(projectId));
    }

    @PutMapping("/{projectId}")
    public Result<ProjectVO> update(@PathVariable Long projectId, @Valid @RequestBody ProjectSave request) {
        return Result.ok(projectService.update(projectId, request));
    }

    @PostMapping("/{projectId}/archive")
    public Result<Void> archive(@PathVariable Long projectId) {
        projectService.archive(projectId);
        return Result.ok();
    }
}
