import type { MemberPermissions } from "../../shared/types/global";
import type { TaskDetail } from "../../shared/types/task";

/** 全部权限：系统管理员在所有项目里都是这样 */
export const allPermissions: MemberPermissions = {
  canEditTask: true,
  canEditSchedule: true,
  canEditDoc: true,
  canManageMember: true,
};

/** 没有任何权限：没加入项目的人 */
export const noPermissions: MemberPermissions = {
  canEditTask: false,
  canEditSchedule: false,
  canEditDoc: false,
  canManageMember: false,
};

/**
 * 能不能看到这个任务：有“编辑任务”权限的看全部，
 * 其他人只看自己负责的，加上关键路径上别人的任务（只读）
 */
export function isTaskVisible(
  task: TaskDetail,
  userId: number,
  canEditTask: boolean,
): boolean {
  return canEditTask || task.critical || task.assignee?.id === userId;
}

/** 能不能改任务的状态：有“编辑任务”权限的改任何人的，其他人只能改自己负责的 */
export function canMoveTask(
  task: TaskDetail,
  userId: number,
  canEditTask: boolean,
): boolean {
  return canEditTask || task.assignee?.id === userId;
}
