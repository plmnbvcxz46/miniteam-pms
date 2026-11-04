import { createContext } from "react";
import type {
  Activity,
  MemberPermissions,
  ProjectRole,
  ProjectSave,
  ProjectSummary,
} from "../types/global";
import type { Member, MemberAdd } from "../types/members";
import type { TaskDetail } from "../types/task";

/**
 * 谁在哪个项目里能做什么，全站只在这里算一次，页面只问不算：
 * - 系统管理员：所有项目都能进，所有权限都有
 * - 其他人：只能进自己加入的项目，权限取自自己在这个项目里的成员记录
 * 项目、成员、权限都来自接口（见 project/ProjectProvider），这里再加上“正在看哪一期”：
 * 过去的期一律只读。后端同样会校验，这里只决定界面显示什么
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
  /** 当前项目已归档：归档后一切只读，和看过去的期一样 */
  isArchived: boolean;
  /** 当前项目是不是带前端假数据的演示项目；任务、文档、讨论等还没接接口，只有它有内容 */
  isDemoProject: boolean;
  /** POST /projects，任何登录用户都能新建，新建后创建人是项目经理；失败抛 ApiError */
  createProject: (values: ProjectSave) => Promise<void>;
  /** PUT /projects/{projectId}；失败抛 ApiError */
  saveProject: (values: ProjectSave) => Promise<void>;
  /** POST /projects/{projectId}/archive；失败抛 ApiError */
  archiveProject: () => Promise<void>;

  /** 我在当前项目里的角色，系统管理员不是成员时为空 */
  projectRole: ProjectRole | null;
  /** 我在当前项目里的权限 */
  permissions: MemberPermissions;

  /** 当前项目的成员和权限变更记录；看过去的期时，只留那时已加入的成员和那天以前的记录 */
  members: Member[];
  permLogs: Activity[];
  /** 邀请成员、改角色、改权限，成功后成员和变更记录会跟着刷新；失败抛 ApiError */
  inviteMember: (body: MemberAdd) => Promise<void>;
  changeMemberRole: (userId: number, role: ProjectRole) => Promise<void>;
  setMemberPermissions: (userId: number, permissions: MemberPermissions) => Promise<void>;
  /** 某个账号在当前项目里的角色，不是成员为空 */
  roleOf: (userId: number) => ProjectRole | null;

  /** 任务：能不能看、能不能改状态，规则见 rules.ts */
  /** 现在能不能新建和修改任务：要有“编辑任务”权限，而且看的是今天这一期，过去的期和已归档的项目只读 */
  canEditTask: boolean;
  /** 只有项目经理和系统管理员能删除任务，过去的期和已归档的项目不能删 */
  canDeleteTask: boolean;
  canViewTask: (task: TaskDetail) => boolean;
  canMoveTask: (task: TaskDetail) => boolean;
}

export const AccessContext = createContext<AccessState | null>(null);
