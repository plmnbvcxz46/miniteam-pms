package org.miniteam.pms.collab.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.miniteam.pms.collab.dto.CommentCreate;
import org.miniteam.pms.collab.dto.CommentVO;
import org.miniteam.pms.collab.dto.DiscussionBriefVO;
import org.miniteam.pms.collab.dto.DiscussionCreate;
import org.miniteam.pms.collab.dto.DiscussionDetailVO;
import org.miniteam.pms.collab.service.DiscussionService;
import org.miniteam.pms.common.result.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DiscussionController {

    private final DiscussionService service;

    public DiscussionController(DiscussionService service) {
        this.service = service;
    }

    @GetMapping("/projects/{projectId}/discussions")
    public Result<List<DiscussionBriefVO>> list(
            @PathVariable Long projectId, @RequestParam(required = false) Long taskId) {
        return Result.ok(service.list(projectId, taskId));
    }

    @PostMapping("/projects/{projectId}/discussions")
    public Result<DiscussionDetailVO> create(
            @PathVariable Long projectId, @Valid @RequestBody DiscussionCreate request) {
        return Result.ok(service.create(projectId, request));
    }

    @GetMapping("/discussions/{discussionId}")
    public Result<DiscussionDetailVO> get(@PathVariable Long discussionId) {
        return Result.ok(service.get(discussionId));
    }

    @PostMapping("/discussions/{discussionId}/comments")
    public Result<CommentVO> comment(@PathVariable Long discussionId, @Valid @RequestBody CommentCreate request) {
        return Result.ok(service.addComment(discussionId, request));
    }
}
