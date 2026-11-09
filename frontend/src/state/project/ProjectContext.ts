import { createContext } from "react";
import type {
  Activity,
  MemberPermissions,
  Project,
  ProjectRole,
  ProjectSave,
  ProjectSummary,
} from "../../types/global";
import type { Member, MemberAdd } from "../../types/members";

/**
 * 项目、成员、权限变更记录的原始数据，都来自接口。
 * 各页面不要直接用这里，用 useAccess()：它在这份数据上加了“看哪一期”和权限判断。
 * 所有写操作失败时抛 ApiError，message 是写给用户看的原因
 */
export interface ProjectState {
  /** GET /projects：系统管理员是全部，其他人是自己加入的 */
  projects: ProjectSummary[];
  /** 当前项目，没有能进的项目时为空 */
  currentProject: ProjectSummary | null;
  /** GET /projects/{projectId}，当前项目还在加载时为空 */
  detail: Project | null;
  /** GET /projects/{projectId}/members */
  members: Member[];
  /** GET /projects/{projectId}/activities?targetType=MEMBER，新的在前 */
  permLogs: Activity[];

  selectProject: (id: number) => void;
  /** POST /projects，新建后自动切到新项目 */
  createProject: (values: ProjectSave) => Promise<void>;
  /** PUT /projects/{projectId} */
  saveProject: (values: ProjectSave) => Promise<void>;
  /** POST /projects/{projectId}/archive */
  archiveProject: () => Promise<void>;
  /** POST /projects/{projectId}/members */
  inviteMember: (body: MemberAdd) => Promise<void>;
  /** PUT /projects/{projectId}/members/{userId} */
  changeMemberRole: (userId: number, role: ProjectRole) => Promise<void>;
  /** PUT /projects/{projectId}/members/{userId}/permissions */
  setMemberPermissions: (userId: number, permissions: MemberPermissions) => Promise<void>;
}

export const ProjectContext = createContext<ProjectState | null>(null);
