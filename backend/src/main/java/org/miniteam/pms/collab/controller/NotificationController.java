package org.miniteam.pms.collab.controller;

import org.miniteam.pms.collab.dto.NotificationVO;
import org.miniteam.pms.collab.service.NotificationService;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.common.result.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public Result<PageResult<NotificationVO>> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.ok(service.list(unreadOnly, page, size));
    }

    @GetMapping("/unread-count")
    public Result<Integer> unreadCount() {
        return Result.ok(service.unreadCount());
    }

    @PutMapping("/{notificationId}/read")
    public Result<Void> markRead(@PathVariable Long notificationId) {
        service.markRead(notificationId);
        return Result.ok();
    }

    @PutMapping("/read-all")
    public Result<Void> markAllRead() {
        service.markAllRead();
        return Result.ok();
    }
}
