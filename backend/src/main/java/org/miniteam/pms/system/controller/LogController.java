package org.miniteam.pms.system.controller;

import java.time.LocalDate;
import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.common.result.Result;
import org.miniteam.pms.system.dto.LogItemVO;
import org.miniteam.pms.system.service.OperationLogService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/logs")
public class LogController {

    private final OperationLogService logService;

    public LogController(OperationLogService logService) {
        this.logService = logService;
    }

    /** 系统操作日志，只有系统管理员能看 */
    @GetMapping
    public Result<PageResult<LogItemVO>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        AuthContext.requireAdmin();
        return Result.ok(logService.list(userId, projectId, targetType, from, to, page, size));
    }
}
