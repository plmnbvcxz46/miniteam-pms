import { createContext, type Dispatch, type SetStateAction } from "react";
import type {
  Activity,
  MemberPermissions,
  ProjectRole,
  ProjectSave,
  ProjectStatus,
  ProjectSummary,
} from "../types/global";
import type { Member } from "../types/members";
import type { TaskDetail } from "../types/task";

/**
 * 谁在哪个项目里能做什么，全站只在这里算一次，页面只问不算：
 * - 系统管理员：所有项目都能进，所有权限都有
 * - 其他人：只能进自己加入的项目，权限取自自己在这个项目里的成员记录
 * 接口接通后由 GET /projects、GET /projects/{projectId}/members 和 GET /auth/me 的结果代替
 */
export interface AccessState {
  isAdmin: boolean;

  /** 我能进的项目，系统管理员是全部，其他人是自己加入的；myProjectRole 是我在里面的角色 */
  projects: ProjectSummary[];
  /** 当前项目，没有能进的项目时为空 */
  currentProject: ProjectSummary | null;
  /** GET /projects/{projectId} 的 description */
  projectDescription: string;
  selectProject: (id: number) => void;
  /** 系统管理员和项目经理能新建项目 */
  canCreateProject: boolean;
  /** POST /projects，新建后创建人是项目经理 */
  createProject: (values: ProjectSave) => void;
  /** PUT /projects/{projectId} */
  saveProject: (values: ProjectSave) => void;
  /** POST /projects/{projectId}/archive 和 /restore */
  setProjectStatus: (status: ProjectStatus) => void;

  /** 我在当前项目里的角色，系统管理员不是成员时为空 */
  projectRole: ProjectRole | null;
  /** 我在当前项目里的权限 */
  permissions: MemberPermissions;

  /** 当前项目的成员和变更记录，成员页改了这里，权限马上跟着变 */
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  permLogs: Activity[];
  setPermLogs: Dispatch<SetStateAction<Activity[]>>;
  /** 某个账号在当前项目里的角色，不是成员为空 */
  roleOf: (userId: number) => ProjectRole | null;

  /** 任务：能不能看、能不能改状态，规则见 rules.ts */
  canViewTask: (task: TaskDetail) => boolean;
  canMoveTask: (task: TaskDetail) => boolean;
}

export const AccessContext = createContext<AccessState | null>(null);
