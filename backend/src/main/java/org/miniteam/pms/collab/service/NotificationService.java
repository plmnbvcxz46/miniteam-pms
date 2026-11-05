package org.miniteam.pms.collab.service;

import org.miniteam.pms.auth.AuthContext;
import org.miniteam.pms.collab.dto.NotificationVO;
import org.miniteam.pms.collab.entity.Notification;
import org.miniteam.pms.collab.mapper.NotificationMapper;
import org.miniteam.pms.common.exception.BusinessException;
import org.miniteam.pms.common.result.PageResult;
import org.miniteam.pms.common.result.ResultCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/** 站内通知：给别的模块发通知，和当前登录用户读自己的通知。 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public static final String ASSIGN = "ASSIGN";
    public static final String MENTION = "MENTION";
    public static final String DELAY = "DELAY";

    private static final int MAX_PAGE_SIZE = 100;

    private final NotificationMapper mapper;

    public NotificationService(NotificationMapper mapper) {
        this.mapper = mapper;
    }

    /** 给某人发一条通知。发失败只打印，不影响正在做的业务。 */
    public void send(Long userId, Long projectId, String type, String title, String content, String link) {
        try {
            Notification n = new Notification();
            n.setUserId(userId);
            n.setProjectId(projectId);
            n.setType(type);
            n.setTitle(cut(title, 128));
            n.setContent(cut(content, 500));
            n.setLink(cut(link, 255));
            mapper.insert(n);
        } catch (RuntimeException e) {
            log.warn("发通知失败：用户 {} 类型 {} {}", userId, type, e.toString());
        }
    }

    /** 今天已经给这个人发过这个项目的这种通知，定时任务防重复用 */
    public boolean sentToday(Long userId, Long projectId, String type) {
        return mapper.countToday(userId, projectId, type) > 0;
    }

    // ---------- 当前用户读自己的通知 ----------

    public PageResult<NotificationVO> list(boolean unreadOnly, int page, int size) {
        Long userId = AuthContext.require().id();
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int offset = (Math.max(page, 1) - 1) * safeSize;
        long total = mapper.count(userId, unreadOnly);
        return PageResult.of(
                total,
                mapper.list(userId, unreadOnly, offset, safeSize).stream()
                        .map(NotificationVO::of)
                        .toList());
    }

    public int unreadCount() {
        return (int) mapper.count(AuthContext.require().id(), true);
    }

    /** 标为已读，只能读自己的；已经读过的再标一次没有影响 */
    public void markRead(Long id) {
        Long userId = AuthContext.require().id();
        if (mapper.countOwned(id, userId) == 0) {
            throw new BusinessException(ResultCode.NOT_FOUND, "通知不存在");
        }
        mapper.markRead(id, userId);
    }

    public void markAllRead() {
        mapper.markAllRead(AuthContext.require().id());
    }

    private static String cut(String text, int max) {
        if (text == null) {
            return null;
        }
        return text.length() > max ? text.substring(0, max - 1) + "…" : text;
    }
}
