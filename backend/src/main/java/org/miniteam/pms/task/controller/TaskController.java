package org.miniteam.pms.task.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.project.dto.ActivityVO;
import org.miniteam.pms.task.dto.BoardVO;
import org.miniteam.pms.task.dto.DependencyTaskVO;
import org.miniteam.pms.task.dto.PredecessorsSet;
import org.miniteam.pms.task.dto.TaskCardVO;
import org.miniteam.pms.task.dto.TaskCreate;
import org.miniteam.pms.task.dto.TaskDetailVO;
import org.miniteam.pms.task.dto.TaskPosition;
import org.miniteam.pms.task.dto.TaskStatusChange;
import org.miniteam.pms.task.dto.TaskUpdate;
import org.miniteam.pms.task.service.TaskService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public Result<List<TaskCardVO>> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "false") boolean mine,
            @RequestParam(defaultValue = "false") boolean criticalOnly,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) String keyword) {
        return Result.ok(taskService.list(projectId, status, assigneeId, mine, criticalOnly, parentId, keyword));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public Result<TaskDetailVO> create(@PathVariable Long projectId, @Valid @RequestBody TaskCreate request) {
        return Result.ok(taskService.create(projectId, request));
    }

    @GetMapping("/projects/{projectId}/board")
    public Result<BoardVO> board(@PathVariable Long projectId, @RequestParam(required = false) String filter) {
        return Result.ok(taskService.board(projectId, filter));
    }

    @GetMapping("/tasks/{taskId}")
    public Result<TaskDetailVO> get(@PathVariable Long taskId) {
        return Result.ok(taskService.get(taskId));
    }

    @PutMapping("/tasks/{taskId}")
    public Result<TaskDetailVO> update(@PathVariable Long taskId, @Valid @RequestBody TaskUpdate request) {
        return Result.ok(taskService.update(taskId, request));
    }

    @DeleteMapping("/tasks/{taskId}")
    public Result<Void> delete(@PathVariable Long taskId) {
        taskService.delete(taskId);
        return Result.ok();
    }

    @PutMapping("/tasks/{taskId}/status")
    public Result<TaskCardVO> status(@PathVariable Long taskId, @Valid @RequestBody TaskStatusChange request) {
        return Result.ok(taskService.changeStatus(taskId, request.status()));
    }

    @PutMapping("/tasks/{taskId}/position")
    public Result<TaskCardVO> position(@PathVariable Long taskId, @Valid @RequestBody TaskPosition request) {
        return Result.ok(taskService.position(taskId, request));
    }

    @PutMapping("/tasks/{taskId}/predecessors")
    public Result<List<DependencyTaskVO>> predecessors(
            @PathVariable Long taskId, @Valid @RequestBody PredecessorsSet request) {
        return Result.ok(taskService.setPredecessors(taskId, request.preTaskIds()));
    }

    @GetMapping("/tasks/{taskId}/activities")
    public Result<List<ActivityVO>> activities(@PathVariable Long taskId) {
        return Result.ok(taskService.activities(taskId));
    }
}
