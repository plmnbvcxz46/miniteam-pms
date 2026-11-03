import { unreadNotificationCount } from "../../../data/global";

/** 铃铛：黑色表示没有未读通知，橙色表示有 */
export default function NotificationBell() {
  const hasUnread = unreadNotificationCount > 0;
  return (
    <button
      className="bell"
      type="button"
      aria-label={hasUnread ? `通知，${unreadNotificationCount} 条未读` : "通知"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path
          d="M4 11V7a4 4 0 018 0v4l1 1.5H3L4 11z"
          fill={hasUnread ? "var(--signal)" : "var(--ink)"}
        />
        <path d="M6.5 14h3" strokeLinecap="round" />
      </svg>
    </button>
  );
}
