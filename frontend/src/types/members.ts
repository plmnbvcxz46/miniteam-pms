/**
 * 成员与权限模块类型定义（对齐 docs/api/openapi.yaml）
 * 共享结构（UserBrief、ProjectRole、MemberPermissions、Activity 等）见 ./global
 */
import type {
  IssueInfo,
  MemberPermissions,
  PermKey,
  ProjectRole,
  UserBrief,
  Activity,
} from "./global";

/** 项目成员（Member），GET /projects/{projectId}/members 的数组元素 */
export interface Member extends MemberPermissions {
  user: UserBrief;
  projectRole: ProjectRole;
  /** 岗位，例如 "后端开发"，可为空 */
  position: string | null;
  /** 本周工时（按任务预估工时折算） */
  weeklyHours: number;
  /** 每周工时上限 */
  weeklyCapacity: number;
  /** 是否超出工时上限 */
  overCapacity: boolean;
  /** 负责中的任务数 */
  taskCount: number;
  /** 加入时间 yyyy-MM-dd HH:mm:ss */
  joinedAt: string;
}

/** 邀请成员请求体（MemberAdd），POST /projects/{projectId}/members */
export interface MemberAdd extends Partial<MemberPermissions> {
  userId: number;
  projectRole?: ProjectRole;
  position?: string;
}

/** 权限行的展示配置（纯前端常量，不来自接口） */
export interface PermDef {
  key: PermKey;
  label: string;
  desc: string;
}

/** 成员页快照（预留往期切换使用） */
export interface MemberSnapshot extends IssueInfo {
  members: Member[];
  permLogs: Activity[];
}
