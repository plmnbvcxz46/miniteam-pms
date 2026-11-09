import { useCallback, useEffect, useState } from "react";
import { notificationApi } from "../api/collab";
import type { Notification } from "../types/global";

/** 通知多久向服务器问一次新的 */
const POLL_MS = 60_000;
/** 铃铛里最多列出多少条，更早的不显示 */
const PAGE_SIZE = 30;

export interface Notifications {
  list: Notification[];
  /** 所有项目里没读的总数（列表只有最近 PAGE_SIZE 条，数量不从列表算） */
  unreadCount: number;
  /** 标为已读，对应 PUT /notifications/{notificationId}/read；失败时保持未读 */
  markRead: (id: number) => Promise<void>;
  /** 全部标为已读，对应 PUT /notifications/read-all */
  markAllRead: () => Promise<void>;
  /** 立刻重新取一次（打开铃铛时用） */
  refresh: () => Promise<void>;
}

/** 顶栏铃铛的通知：登录后取一次，之后每分钟取一次；取失败就保持上次的内容 */
export function useNotifications(): Notifications {
  const [list, setList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const [page, count] = await Promise.all([
      notificationApi.list({ page: 1, size: PAGE_SIZE }),
      notificationApi.unreadCount(),
    ]);
    setList(page.list);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    const load = () => {
      refresh().catch(() => {
        // 网络不通或接口报错时保持上次的内容，下一轮再试
      });
    };
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const markRead = useCallback(
    async (id: number) => {
      await notificationApi.markRead(id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      await refresh().catch(() => undefined);
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return { list, unreadCount, markRead, markAllRead, refresh };
}
