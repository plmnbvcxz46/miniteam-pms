import { useMemo, type ReactNode } from "react";
import { useMe } from "../auth/useAuth";
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
  const { isPast, today, snapshot } = useIssue();
  const isAdmin = isSystemAdmin(me);
  const { currentProject, detail } = project;
  const isArchived = currentProject?.status === "ARCHIVED";
  // 过去的期和已归档的项目都是只读
  const readOnly = isPast || isArchived;

  // 看过去的期时，成员只留那天已加入的，本周工时、负责任务数取那一期快照里的；快照还没取到时按加入时间先筛一遍
  const members = useMemo(() => {
    if (!isPast) return project.members;
    if (snapshot) {
      const past = new Map(snapshot.members.map((m) => [m.user.id, m]));
      return project.members
        .filter((m) => past.has(m.user.id))
        .map((m) => {
          const p = past.get(m.user.id)!;
          return {
            ...m,
            weeklyHours: p.weeklyHours,
            weeklyCapacity: p.weeklyCapacity,
            taskCount: p.taskCount,
            overCapacity: p.overCapacity,
          };
        });
    }
    return project.members.filter((m) => m.joinedAt.slice(0, 10) <= today);
  }, [project.members, isPast, snapshot, today]);
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
