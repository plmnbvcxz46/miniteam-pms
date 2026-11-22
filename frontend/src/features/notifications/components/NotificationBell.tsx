import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionPopover,
  ActionPopoverFooterButton,
} from "../../../components/patterns/ActionPopover";
import { Button } from "../../../components/ui/Button";
import { notificationTypeLabel } from "../../../shared/constants/labels";
import type { Notification } from "../../../shared/types/global";
import { getLocalToday } from "../../../shared/utils/date";
import { formatNotificationTime } from "../utils";
import styles from "./NotificationBell.module.css";

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

function BellIcon({ hasUnread }: { hasUnread: boolean }) {
  const maskId = useId();
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--color-border-strong)"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {hasUnread && (
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="-2"
          y="-2"
          width="20"
          height="20"
        >
          <rect
            x="-2"
            y="-2"
            width="20"
            height="20"
            fill="white"
            stroke="none"
          />
          <rect
            x="8.75"
            y="-2"
            width="9.25"
            height="9.25"
            fill="black"
            stroke="none"
          />
        </mask>
      )}
      <g mask={hasUnread ? `url(#${maskId})` : undefined}>
        <g transform="translate(-0.75 0.5)">
          <path d="M4.25 11.75V7a3.75 3.75 0 017.5 0v4.75M2.5 11.75h11" />
          <path
            d="M6.5 13.5h3v1.5h-3z"
            fill="var(--color-border-strong)"
            stroke="none"
          />
        </g>
      </g>
      {hasUnread && (
        <rect
          x="10"
          y="1.5"
          width="4.5"
          height="4.5"
          fill="var(--color-accent)"
          stroke="none"
        />
      )}
    </svg>
  );
}

function NotificationRow({
  notification,
  today,
  onOpen,
}: {
  notification: Notification;
  today: string;
  onOpen: (item: Notification) => void;
}) {
  return (
    <button
      type="button"
      data-unread={notification.isRead ? undefined : "true"}
      className={styles.item}
      onClick={() => onOpen(notification)}
    >
      <span
        className={styles.type}
        data-risk={notification.type === "DELAY" ? "true" : undefined}
      >
        {notificationTypeLabel[notification.type]}
      </span>
      <span className={styles.title}>{notification.title}</span>
      <span className={styles.time} title={notification.createdAt}>
        {formatNotificationTime(notification.createdAt, today)}
      </span>
      {notification.content && (
        <span className={styles.content}>{notification.content}</span>
      )}
    </button>
  );
}

/** 黑色空心铃铛，有未读通知时右上角多一个橙色方块，铃铛在方块周围留出缺口 */
export function NotificationBell({
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
  const hasUnread = unreadCount > 0;
  const today = getLocalToday();

  const handleOpenChange = (next: boolean) => {
    if (next) onOpenBell();
    setOpen(next);
  };

  // 点通知：标为已读，有链接就跳过去（@ 通知会落到讨论里的那条消息）
  const handleOpenItem = (notification: Notification) => {
    if (!notification.isRead) onRead(notification.id).catch(() => undefined);
    setOpen(false);
    if (
      notification.projectId !== null &&
      notification.projectId !== currentProjectId
    ) {
      onSwitchProject(notification.projectId);
    }
    if (notification.link) navigate(notification.link);
  };

  return (
    <ActionPopover
      open={open}
      onOpenChange={handleOpenChange}
      title="INBOX"
      meta={hasUnread ? `${unreadCount} 未读` : undefined}
      width="md"
      align="end"
      isEmpty={notifications.length === 0}
      emptyText="暂无通知"
      trigger={
        <Button
          variant="default"
          size="icon"
          aria-label={hasUnread ? `通知，${unreadCount} 条未读` : "通知"}
        >
          <BellIcon hasUnread={hasUnread} />
        </Button>
      }
      footer={
        hasUnread ? (
          <ActionPopoverFooterButton
            onClick={() => void onReadAll().catch(() => undefined)}
          >
            全部标为已读
          </ActionPopoverFooterButton>
        ) : undefined
      }
    >
      {notifications.map((n) => (
        <NotificationRow
          key={n.id}
          notification={n}
          today={today}
          onOpen={handleOpenItem}
        />
      ))}
    </ActionPopover>
  );
}
