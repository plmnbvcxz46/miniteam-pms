package org.miniteam.pms.progress.controller;

import java.time.LocalDate;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.progress.dto.IssueSnapshotVO;
import org.miniteam.pms.progress.service.IssueSnapshotService;
import org.miniteam.pms.project.dto.IssueSummaryVO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** 往期日报：列表和某一期的快照。 */
@RestController
public class IssueController {

    private final IssueSnapshotService issueService;

    public IssueController(IssueSnapshotService issueService) {
        this.issueService = issueService;
    }

    @GetMapping("/projects/{projectId}/issues")
    public Result<List<IssueSummaryVO>> issues(@PathVariable Long projectId) {
        return Result.ok(issueService.list(projectId));
    }

    @GetMapping("/projects/{projectId}/issues/{issueDate}")
    public Result<IssueSnapshotVO> issue(
            @PathVariable Long projectId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate) {
        return Result.ok(issueService.get(projectId, issueDate));
    }
}
