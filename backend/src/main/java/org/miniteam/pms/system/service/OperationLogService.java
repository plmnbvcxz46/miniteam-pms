package org.miniteam.pms.system.service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.system.dto.LogItemVO;
import org.miniteam.pms.system.mapper.OperationLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** 写入和查询操作日志（任务操作记录、项目动态、权限变更记录共用这张表）。 */
@Service
public class OperationLogService {

    private static final Logger log = LoggerFactory.getLogger(OperationLogService.class);

    private static final int MAX_DETAIL = 500;
    private static final int MAX_PAGE_SIZE = 100;

    private final OperationLogMapper mapper;

    public OperationLogService(OperationLogMapper mapper) {
        this.mapper = mapper;
    }

    /** 记一条日志。写日志失败只打印，不影响正在做的业务。 */
    public void record(Long userId, Long projectId, String targetType, Long targetId, String action, String detail) {
        try {
            String text = detail != null && detail.length() > MAX_DETAIL ? detail.substring(0, MAX_DETAIL) : detail;
            mapper.insert(userId, projectId, targetType, targetId, action, text, currentIp());
        } catch (RuntimeException e) {
            log.warn("写操作日志失败：{} {} {}", targetType, action, e.toString());
        }
    }

    public PageResult<LogItemVO> list(
            Long userId, Long projectId, String targetType, LocalDate from, LocalDate to, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int offset = (Math.max(page, 1) - 1) * safeSize;
        long total = mapper.count(userId, projectId, targetType, from, to);
        var rows = mapper.list(userId, projectId, targetType, from, to, offset, safeSize);
        return PageResult.of(total, rows.stream().map(LogItemVO::of).toList());
    }

    private static String currentIp() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (!(attributes instanceof ServletRequestAttributes servlet)) {
            return null;
        }
        HttpServletRequest request = servlet.getRequest();
        // 线上经 nginx 转发，取第一跳；只用于日志展示，不作安全判断
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip =
                forwarded != null && !forwarded.isBlank() ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        return ip.length() > 64 ? ip.substring(0, 64) : ip;
    }
}
