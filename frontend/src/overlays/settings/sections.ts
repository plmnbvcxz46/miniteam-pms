import type { SettingsSectionId } from "../../types/settings";

/**
 * access：谁能看到这个分区
 * - all：所有人
 * - project：能管理项目成员的人（本项目的信息）
 * - system：系统管理员（系统级的人员、日志、参数）
 */
export const sections: {
  id: SettingsSectionId;
  group: string;
  name: string;
  access: "all" | "project" | "system";
}[] = [
  { id: "me", group: "我的", name: "个人", access: "all" },
  { id: "proj", group: "本项目", name: "项目信息", access: "project" },
  { id: "people", group: "系统", name: "人员", access: "system" },
  { id: "logs", group: "系统", name: "日志", access: "system" },
  { id: "params", group: "系统", name: "系统参数", access: "system" },
];

export type SectionId = SettingsSectionId;

/** 看分区要用到的身份信息，来自 useAccess() */
export interface SectionViewer {
  isAdmin: boolean;
  /** 在当前项目里有没有“管理成员”权限 */
  canManageMember: boolean;
  /** 有没有能进的项目 */
  hasProject: boolean;
}

/** 这个身份能看到的分区 */
export function getVisibleSections(viewer: SectionViewer) {
  return sections.filter(
    (s) =>
      s.access === "all" ||
      (s.access === "project" && viewer.hasProject && viewer.canManageMember) ||
      (s.access === "system" && viewer.isAdmin),
  );
}

/** 打开抽屉时的分区：想看的分区没有权限就退回第一个能看的 */
export function resolveSection(
  wanted: SectionId,
  visible: ReturnType<typeof getVisibleSections>,
): SectionId {
  return visible.some((s) => s.id === wanted) ? wanted : visible[0].id;
}
