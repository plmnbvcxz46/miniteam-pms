import { useMemo, type ReactNode } from "react";
import { useMe } from "../auth/useAuth";
import { currentProjectId } from "../data/global";
import { issueMemberHours } from "../data/issueMemberHours";
import { useIssue } from "../issue/useIssue";
import { useProject } from "../project/useProject";
import { isSystemAdmin } from "../types/auth";
import { AccessContext, type AccessState } from "./AccessContext";
import {
  allPermissions,
  canMoveTask as canMoveTaskRule,
  isTaskVisible,
  noPermissions,
} from "./rules";

/** 登录后才会渲染，所以拿得到非空的当前身份 */
export default function AccessProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const project = useProject();
  const { isPast, viewing, today } = useIssue();
  const isAdmin = isSystemAdmin(me);
  const { currentProject, detail } = project;
  const projectId = currentProject?.id ?? null;
  const isArchived = currentProject?.status === "ARCHIVED";
  // 过去的期和已归档的项目都是只读
  const readOnly = isPast || isArchived;

  // 看过去的期时，成员只留当时已加入的，本周工时取当时的；变更记录只留那一天以前的
  const members = useMemo(() => {
    if (!isPast) return project.members;
    const hours = issueMemberHours[viewing.issueNo] ?? {};
    return project.members
      .filter((m) => m.joinedAt.slice(0, 10) <= today)
      .map((m) => {
        const weeklyHours = hours[m.user.username] ?? m.weeklyHours;
        return {
          ...m,
          weeklyHours,
          overCapacity: weeklyHours > m.weeklyCapacity,
        };
      });
  }, [project.members, isPast, viewing.issueNo, today]);
  const permLogs = useMemo(
    () =>
      isPast
        ? project.permLogs.filter((log) => log.createdAt.slice(0, 10) <= today)
        : project.permLogs,
    [project.permLogs, isPast, today],
  );

  const projectRole = currentProject?.myProjectRole ?? null;
  // 权限以后端算的为准（系统管理员全是 true）；详情还没回来时先当没有权限
  const permissions = isAdmin
    ? allPermissions
    : (detail?.myPermissions ?? noPermissions);

  const value: AccessState = {
    isAdmin,
    projects: project.projects,
    currentProject,
    projectDescription: detail?.description ?? "",
    selectProject: project.selectProject,
    isArchived,
    isDemoProject: projectId === currentProjectId,
    createProject: project.createProject,
    saveProject: project.saveProject,
    archiveProject: project.archiveProject,
    projectRole,
    permissions,
    members,
    permLogs,
    inviteMember: project.inviteMember,
    changeMemberRole: project.changeMemberRole,
    setMemberPermissions: project.setMemberPermissions,
    roleOf: (userId) =>
      project.members.find((m) => m.user.id === userId)?.projectRole ?? null,
    canEditTask: permissions.canEditTask && !readOnly,
    canDeleteTask: (isAdmin || projectRole === "PM") && !readOnly,
    canViewTask: (task) => isTaskVisible(task, me.user.id, permissions.canEditTask),
    canMoveTask: (task) =>
      !readOnly && canMoveTaskRule(task, me.user.id, permissions.canEditTask),
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
