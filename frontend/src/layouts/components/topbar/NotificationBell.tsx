import { unreadNotificationCount } from "../../../data/global";

/** 黑色空心铃铛，有未读通知时右上角多一个橙色方块，铃铛在方块周围留出缺口 */
export default function NotificationBell() {
  const hasUnread = unreadNotificationCount > 0;
  return (
    <button
      className="bell"
      type="button"
      aria-label={hasUnread ? `通知，${unreadNotificationCount} 条未读` : "通知"}
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
          <mask id="bell-notch" maskUnits="userSpaceOnUse" x="-2" y="-2" width="20" height="20">
            <rect x="-2" y="-2" width="20" height="20" fill="white" stroke="none" />
            <rect x="10" y="-2" width="8" height="8" fill="black" stroke="none" />
          </mask>
        )}
        <g mask={hasUnread ? "url(#bell-notch)" : undefined}>
          <g transform="translate(-0.75 0.5)">
            <path d="M4.25 11.75V7a3.75 3.75 0 017.5 0v4.75M2.5 11.75h11" />
            <path d="M6.5 13.5h3v1.5h-3z" fill="var(--ink)" stroke="none" />
          </g>
        </g>
        {hasUnread && (
          <rect x="11" y="0.5" width="4.5" height="4.5" fill="var(--signal)" stroke="none" />
        )}
      </svg>
    </button>
  );
}
