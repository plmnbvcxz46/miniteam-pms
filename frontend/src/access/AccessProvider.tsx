import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useMe } from "../auth/useAuth";
import {
  projectDescriptions as initialDescriptions,
  projects as initialProjects,
} from "../data/global";
import {
  makeMember,
  projectMembers as initialMembers,
  projectPermLogs as initialLogs,
} from "../data/members";
import { isSystemAdmin } from "../types/auth";
import type {
  Activity,
  ProjectSave,
  ProjectStatus,
  ProjectSummary,
} from "../types/global";
import type { Member } from "../types/members";
import { getProjectToday } from "../utils/date";
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
  const isAdmin = isSystemAdmin(me);

  const [projectList, setProjectList] = useState<ProjectSummary[]>(initialProjects);
  const [descriptions, setDescriptions] = useState(initialDescriptions);
  const [memberMap, setMemberMap] = useState(initialMembers);
  const [logMap, setLogMap] = useState(initialLogs);
  const [currentId, setCurrentId] = useState(initialProjects[0].id);

  const roleIn = useCallback(
    (projectId: number, userId: number) =>
      memberMap[projectId]?.find((m) => m.user.id === userId)?.projectRole ?? null,
    [memberMap],
  );

  // 我能进的项目：系统管理员是全部，其他人是自己加入的
  const projects = useMemo(
    () =>
      projectList
        .filter((p) => isAdmin || roleIn(p.id, me.user.id) !== null)
        .map((p) => ({ ...p, myProjectRole: roleIn(p.id, me.user.id) })),
    [projectList, isAdmin, roleIn, me.user.id],
  );
  // 切换账号后原来的项目可能进不去了，退回第一个能进的
  const currentProject = projects.find((p) => p.id === currentId) ?? projects[0] ?? null;
  const projectId = currentProject?.id ?? null;

  const members = useMemo(
    () => (projectId === null ? [] : (memberMap[projectId] ?? [])),
    [memberMap, projectId],
  );
  const permLogs = useMemo(
    () => (projectId === null ? [] : (logMap[projectId] ?? [])),
    [logMap, projectId],
  );

  const myMember = members.find((m) => m.user.id === me.user.id);
  const permissions = isAdmin
    ? allPermissions
    : myMember
      ? {
          canEditTask: myMember.canEditTask,
          canEditSchedule: myMember.canEditSchedule,
          canEditDoc: myMember.canEditDoc,
          canManageMember: myMember.canManageMember,
        }
      : noPermissions;

  const setMembers: Dispatch<SetStateAction<Member[]>> = useCallback(
    (action) => {
      if (projectId === null) return;
      setMemberMap((prev) => ({
        ...prev,
        [projectId]:
          typeof action === "function" ? action(prev[projectId] ?? []) : action,
      }));
    },
    [projectId],
  );
  const setPermLogs: Dispatch<SetStateAction<Activity[]>> = useCallback(
    (action) => {
      if (projectId === null) return;
      setLogMap((prev) => ({
        ...prev,
        [projectId]:
          typeof action === "function" ? action(prev[projectId] ?? []) : action,
      }));
    },
    [projectId],
  );

  const createProject = (values: ProjectSave) => {
    const id = Math.max(0, ...projectList.map((p) => p.id)) + 1;
    const project: ProjectSummary = {
      id,
      name: values.name,
      status: "ACTIVE",
      startDate: values.startDate,
      planEnd: values.planEnd,
      issueNo: 1,
      headline: null,
      myProjectRole: null,
    };
    setProjectList((prev) => [project, ...prev]);
    setDescriptions((prev) => ({ ...prev, [id]: values.description ?? "" }));
    // 创建人是这个项目的项目经理
    setMemberMap((prev) => ({
      ...prev,
      [id]: [makeMember(me.user, "PM", "项目经理", `${getProjectToday()} 00:00:00`)],
    }));
    setLogMap((prev) => ({ ...prev, [id]: [] }));
    setCurrentId(id);
  };

  const saveProject = (values: ProjectSave) => {
    if (projectId === null) return;
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, name: values.name, startDate: values.startDate, planEnd: values.planEnd }
          : p,
      ),
    );
    setDescriptions((prev) => ({ ...prev, [projectId]: values.description ?? "" }));
  };

  const setProjectStatus = (status: ProjectStatus) => {
    if (projectId === null) return;
    setProjectList((prev) => prev.map((p) => (p.id === projectId ? { ...p, status } : p)));
  };

  const canCreateProject =
    isAdmin || projectList.some((p) => roleIn(p.id, me.user.id) === "PM");

  const value: AccessState = {
    isAdmin,
    projects,
    currentProject,
    projectDescription: projectId === null ? "" : (descriptions[projectId] ?? ""),
    selectProject: (id) => {
      if (projects.some((p) => p.id === id)) setCurrentId(id);
    },
    canCreateProject,
    createProject,
    saveProject,
    setProjectStatus,
    projectRole: projectId === null ? null : roleIn(projectId, me.user.id),
    permissions,
    members,
    setMembers,
    permLogs,
    setPermLogs,
    roleOf: (userId) => (projectId === null ? null : roleIn(projectId, userId)),
    canViewTask: (task) => isTaskVisible(task, me.user.id, permissions.canEditTask),
    canMoveTask: (task) => canMoveTaskRule(task, me.user.id, permissions.canEditTask),
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
