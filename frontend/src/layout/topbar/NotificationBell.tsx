import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationTypeLabel } from "../../shared/constants/labels";
import type { Notification } from "../../shared/types/global";
import { getLocalToday } from "../../shared/utils/date";
import { useDismiss } from "../useDismiss";
import { formatNotificationTime } from "../utils";

interface NotificationBellProps {
  notifications: Notification[];
  /** 所有项目里没读的总数 */
  unreadCount: number;
  /** 当前项目，通知属于别的项目时先切过去再跳转 */
  currentProjectId: number | null;
  /** 打开铃铛时通知外面重新取一次 */
  onOpenBell: () => void;
  onRead: (id: number) => Promise<void>;
  onReadAll: () => Promise<void>;
  onSwitchProject: (projectId: number) => void;
}

/** 黑色空心铃铛，有未读通知时右上角多一个橙色方块，铃铛在方块周围留出缺口 */
export default function NotificationBell({
  notifications,
  unreadCount,
  currentProjectId,
  onOpenBell,
  onRead,
  onReadAll,
  onSwitchProject,
}: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);
  const hasUnread = unreadCount > 0;
  const today = getLocalToday();

  // 点通知：标为已读，有链接就跳过去（@ 通知会落到讨论里的那条消息）
  const handleOpen = (notification: Notification) => {
    if (!notification.isRead) onRead(notification.id).catch(() => undefined);
    close();
    if (notification.projectId !== null && notification.projectId !== currentProjectId) {
      onSwitchProject(notification.projectId);
    }
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="bell-wrap" ref={rootRef}>
      <button
        className="bell"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={hasUnread ? `通知，${unreadCount} 条未读` : "通知"}
        onClick={() => {
          if (!open) onOpenBell();
          setOpen((v) => !v);
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {hasUnread && (
            <mask
              id="bell-notch"
              maskUnits="userSpaceOnUse"
              x="-2"
              y="-2"
              width="20"
              height="20"
            >
              <rect x="-2" y="-2" width="20" height="20" fill="white" stroke="none" />
              <rect x="8.75" y="-2" width="9.25" height="9.25" fill="black" stroke="none" />
            </mask>
          )}
          <g mask={hasUnread ? "url(#bell-notch)" : undefined}>
            <g transform="translate(-0.75 0.5)">
              <path d="M4.25 11.75V7a3.75 3.75 0 017.5 0v4.75M2.5 11.75h11" />
              <path d="M6.5 13.5h3v1.5h-3z" fill="var(--ink)" stroke="none" />
            </g>
          </g>
          {hasUnread && (
            <rect x="10" y="1.5" width="4.5" height="4.5" fill="var(--signal)" stroke="none" />
          )}
        </svg>
      </button>
      {open && (
        <div className="issues notes">
          <h4>
            INBOX
            <em>{hasUnread && `${unreadCount} 未读`}</em>
          </h4>
          <div className="list scroll-y">
            {notifications.length === 0 && <p className="pempty">暂无通知</p>}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={n.isRead ? undefined : "unread"}
                onClick={() => handleOpen(n)}
              >
                <span className={n.type === "DELAY" ? "no risk-t" : "no"}>
                  {notificationTypeLabel[n.type]}
                </span>
                <span className="hd">{n.title}</span>
                <span className="tm" title={n.createdAt}>
                  {formatNotificationTime(n.createdAt, today)}
                </span>
                {n.content && <span className="ct">{n.content}</span>}
              </button>
            ))}
          </div>
          {hasUnread && (
            <button type="button" className="pfoot" onClick={() => void onReadAll().catch(() => undefined)}>
              全部标为已读
            </button>
          )}
        </div>
      )}
    </div>
  );
}
