/** 侧边栏用到的图标名 */
export type NavIconName =
  | "overview"
  | "board"
  | "timeline"
  | "reports"
  | "collab"
  | "documents"
  | "members"
  | "settings";

/** 16×16 方角线条图标，和顶栏铃铛同一套画法，颜色跟随文字 */
const paths: Record<NavIconName, string> = {
  overview: "M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z",
  board: "M2.5 2.5h3.5v11H2.5zM6.75 2.5h3.5v7.5h-3.5zM11 2.5h2.5v4.5H11z",
  timeline: "M2.5 2.5h6v2.5h-6zM6 6.75h7.5v2.5H6zM4 11h7v2.5H4z",
  reports: "M2.5 8h3v5.5h-3zM6.5 2.5h3v11h-3zM10.5 5.5h3v8h-3z",
  collab: "M2.5 3h11v7.5H7.5L4.5 13.5v-3h-2z",
  documents: "M3.5 2h6l3 3v9h-9zM9.5 2v3h3M5.5 8h5M5.5 11h5",
  members: "M8 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 14c0-3 2.2-4.5 5-4.5s5 1.5 5 4.5z",
  settings: "M2 4.5h12M2 11.5h12M4 3h2.5v3H4zM9.5 10h2.5v3H9.5z",
};

export default function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
