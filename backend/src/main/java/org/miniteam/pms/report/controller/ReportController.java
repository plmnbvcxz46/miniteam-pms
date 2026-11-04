package org.miniteam.pms.report.controller;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.report.dto.ReportsVO;
import org.miniteam.pms.report.service.ReportService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReportController {

    private static final MediaType XLSX =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/projects/{projectId}/reports/summary")
    public Result<ReportsVO.Summary> summary(@PathVariable Long projectId) {
        return Result.ok(reportService.summary(projectId));
    }

    @GetMapping("/projects/{projectId}/reports/burndown")
    public Result<ReportsVO.Burndown> burndown(
            @PathVariable Long projectId, @RequestParam(required = false) String range) {
        return Result.ok(reportService.burndown(projectId, range));
    }

    @GetMapping("/projects/{projectId}/reports/weekly-completed")
    public Result<List<ReportsVO.WeeklyCompleted>> weeklyCompleted(@PathVariable Long projectId) {
        return Result.ok(reportService.weeklyCompleted(projectId));
    }

    /** milestoneId 里程碑不实现，忽略 */
    @GetMapping("/projects/{projectId}/reports/duration-deviation")
    public Result<List<ReportsVO.DurationDeviation>> durationDeviation(
            @PathVariable Long projectId, @RequestParam(required = false) Long milestoneId) {
        return Result.ok(reportService.durationDeviation(projectId));
    }

    @GetMapping("/projects/{projectId}/reports/forecast")
    public Result<ReportsVO.Forecast> forecast(@PathVariable Long projectId) {
        return Result.ok(reportService.forecast(projectId));
    }

    @GetMapping("/projects/{projectId}/reports/export")
    public ResponseEntity<byte[]> export(@PathVariable Long projectId) {
        ReportService.Export file = reportService.export(projectId);
        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(file.fileName(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .body(file.content());
    }
}
