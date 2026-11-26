import { useMemo, type ReactNode } from "react";
import { isSystemAdmin } from "../../shared/types/auth";
import type { Member } from "../../shared/types/members";
import type { IssuePages } from "../../shared/types/progress";
import { useMe } from "../auth/useAuth";
import { useIssue } from "../issue/useIssue";
import { useProject } from "../project/useProject";
import { AccessContext, type AccessState } from "./AccessContext";
import {
  allPermissions,
  canMoveTask as canMoveTaskRule,
  isTaskVisible,
  noPermissions,
} from "./rules";

function deriveMembers(
  rawMembers: Member[],
  isPast: boolean,
  snapshot: IssuePages | null,
  today: string,
): Member[] {
  if (!isPast) return rawMembers;
  if (snapshot) {
    const past = new Map(snapshot.members.map((m) => [m.user.id, m]));
    return rawMembers
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
  return rawMembers.filter((m) => m.joinedAt.slice(0, 10) <= today);
}

/** 登录后才会渲染，所以拿得到非空的当前身份 */
export default function AccessProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const project = useProject();
  const { isPast, today, snapshot } = useIssue();
  const isAdmin = isSystemAdmin(me);
  const { currentProject, detail } = project;
  const isArchived = currentProject?.status === "ARCHIVED";
  const readOnly = isPast || isArchived;

  const members = useMemo(
    () => deriveMembers(project.members, isPast, snapshot, today),
    [project.members, isPast, snapshot, today],
  );
  const permLogs = useMemo(
    () =>
      isPast
        ? project.permLogs.filter((log) => log.createdAt.slice(0, 10) <= today)
        : project.permLogs,
    [project.permLogs, isPast, today],
  );

  const projectRole = currentProject?.myProjectRole ?? null;
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
