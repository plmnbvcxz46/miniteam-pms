import type { Notification } from "../shared/types/global";
import { http } from "../api/http";

export const notificationApi = {
  list: (query: { unreadOnly?: boolean; page?: number; size?: number } = {}) =>
    http.get<{ total: number; list: Notification[] }>("/notifications", query),
  unreadCount: () => http.get<number>("/notifications/unread-count"),
  markRead: (notificationId: number) =>
    http.put<void>(`/notifications/${notificationId}/read`),
  markAllRead: () => http.put<void>("/notifications/read-all"),
};
