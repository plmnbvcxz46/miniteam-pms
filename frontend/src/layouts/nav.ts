import type { NavIconName } from "./components/sidebar/NavIcon";

/** 侧边栏导航项 */
export interface NavItem {
  to: string;
  label: string;
  icon: NavIconName;
  /** 角标：阻塞任务数，只有任务页有 */
  badge?: "risk";
}

/** 侧边栏导航分组，label 显示成分组上方的 “// 项目” */
export interface NavGroup {
  label: string;
  ariaLabel: string;
  items: NavItem[];
}

/** 页面导航，“系统管理”不是页面而是打开抽屉，由 SidebarNav 单独渲染 */
export const navGroups: NavGroup[] = [
  {
    label: "// 项目",
    ariaLabel: "项目",
    items: [
      { to: "/overview", label: "概览", icon: "overview" },
      { to: "/board", label: "任务", icon: "board", badge: "risk" },
      { to: "/timeline", label: "时间线", icon: "timeline" },
      { to: "/reports", label: "统计报表", icon: "reports" },
    ],
  },
  {
    label: "// 团队",
    ariaLabel: "团队",
    items: [
      { to: "/collab", label: "团队协作", icon: "collab" },
      { to: "/documents", label: "文档", icon: "documents" },
      { to: "/members", label: "成员与权限", icon: "members" },
    ],
  },
];
