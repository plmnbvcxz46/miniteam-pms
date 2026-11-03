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
import { issueMemberHours } from "../data/issueMemberHours";
import { useIssue } from "../issue/useIssue";
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
  const { isPast, viewing, today } = useIssue();
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

  // 看过去的期时，成员只留当时已加入的，本周工时取当时的；变更记录只留那一天以前的
  const members = useMemo(() => {
    const list = projectId === null ? [] : (memberMap[projectId] ?? []);
    if (!isPast) return list;
    const hours = issueMemberHours[viewing.issueNo] ?? {};
    return list
      .filter((m) => m.joinedAt.slice(0, 10) <= today)
      .map((m) => {
        const weeklyHours = hours[m.user.username] ?? m.weeklyHours;
        return {
          ...m,
          weeklyHours,
          overCapacity: weeklyHours > m.weeklyCapacity,
        };
      });
  }, [memberMap, projectId, isPast, viewing.issueNo, today]);
  const permLogs = useMemo(() => {
    const list = projectId === null ? [] : (logMap[projectId] ?? []);
    return isPast ? list.filter((log) => log.createdAt.slice(0, 10) <= today) : list;
  }, [logMap, projectId, isPast, today]);

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
    canEditTask: permissions.canEditTask && !isPast,
    canDeleteTask:
      (isAdmin || (projectId !== null && roleIn(projectId, me.user.id) === "PM")) &&
      !isPast,
    canViewTask: (task) => isTaskVisible(task, me.user.id, permissions.canEditTask),
    canMoveTask: (task) =>
      !isPast && canMoveTaskRule(task, me.user.id, permissions.canEditTask),
  };

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
