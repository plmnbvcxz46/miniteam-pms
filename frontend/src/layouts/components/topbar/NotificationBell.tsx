export default function NotificationBell() {
  return (
    <button className="bell" type="button" aria-label="通知">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M4 11V7a4 4 0 018 0v4l1 1.5H3L4 11z" />
        <path d="M6.5 14h3" />
      </svg>
      <i aria-hidden="true" />
    </button>
  );
}
