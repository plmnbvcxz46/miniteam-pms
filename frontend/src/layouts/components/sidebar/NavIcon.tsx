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

/**
 * 16×16 方角图标，内容落在 2~14 之内，颜色跟随文字。
 * 每个图标分两层：line 是 1.5 的结构线，solid 是不描边的实心重点块；
 * 两条描边之间至少留 1.5 的白缝，避免小尺寸下糊成一团
 */
const icons: Record<NavIconName, { line?: string; solid?: string }> = {
  overview: {
    line: "M2.75 9.75h3.5v3.5h-3.5zM9.75 2.75h3.5v3.5h-3.5zM9.75 9.75h3.5v3.5h-3.5z",
    solid: "M2 2h5v5H2z",
  },
  board: {
    line: "M2.75 2.75h10.5v10.5H2.75z",
    solid: "M4.75 4.75h2.5v6.5h-2.5zM8.75 4.75h2.5v3.5h-2.5z",
  },
  timeline: {
    line: "M2.75 2v12",
    solid: "M5 2.5h6.5v2.5H5zM8 6.75h6v2.5H8zM5 11h5.5v2.5H5z",
  },
  reports: {
    line: "M2 13.25h12",
    solid: "M3 8h2.5v4.5H3zM6.75 3h2.5v9.5h-2.5zM10.5 5.5H13v7h-2.5z",
  },
  collab: {
    line: "M2.75 2.75h10.5v8H7.5l-3 2.5v-2.5H2.75z",
    solid:
      "M4.75 5.75h1.75v1.75H4.75zM7.125 5.75h1.75v1.75h-1.75zM9.5 5.75h1.75v1.75H9.5z",
  },
  documents: {
    line: "M3 2.75h6.5l3.5 3.5v7H3zM5.5 8.5h5M5.5 11h3.5",
    solid: "M9.5 2.75v3.5H13z",
  },
  members: {
    solid: "M5.75 2h4.5v4.5h-4.5zM2 14v-2.5L4 9.5h8l2 2V14z",
  },
  settings: {
    line: "M2 4.75h12M2 11.25h12",
    solid: "M4 2.25h3v5H4zM9 8.75h3v5H9z",
  },
};

export default function NavIcon({ name }: { name: NavIconName }) {
  const { line, solid } = icons[name];
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="miter"
      strokeMiterlimit="2"
      aria-hidden="true"
    >
      {line && <path d={line} />}
      {solid && <path d={solid} fill="currentColor" stroke="none" />}
    </svg>
  );
}
