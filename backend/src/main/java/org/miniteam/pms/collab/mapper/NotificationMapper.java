package org.miniteam.pms.collab.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.miniteam.pms.collab.entity.Notification;

@Mapper
public interface NotificationMapper {

    void insert(Notification notification);

    List<Notification> list(
            @Param("userId") Long userId,
            @Param("unreadOnly") boolean unreadOnly,
            @Param("offset") int offset,
            @Param("size") int size);

    long count(@Param("userId") Long userId, @Param("unreadOnly") boolean unreadOnly);

    /** 这条通知是不是这个人的（1 是，0 不是或不存在） */
    int countOwned(@Param("id") Long id, @Param("userId") Long userId);

    /** 只改自己的通知 */
    int markRead(@Param("id") Long id, @Param("userId") Long userId);

    int markAllRead(@Param("userId") Long userId);

    /** 这个人、这个项目、这种类型的通知今天已经发过几条，定时任务防重复用 */
    int countToday(@Param("userId") Long userId, @Param("projectId") Long projectId, @Param("type") String type);
}
