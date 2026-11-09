import type { NotificationType, ProjectRole } from "../types/global";

/** 通知类型中文名 */
export const notificationTypeLabel: Record<NotificationType, string> = {
  ASSIGN: "指派",
  MENTION: "被 @",
  DELAY: "延期",
  DEFECT: "缺陷",
  SYSTEM: "系统",
};

/** 角色中文名 */
export const roleLabel: Record<ProjectRole, string> = {
  PM: "项目经理",
  MEMBER: "普通成员",
  TESTER: "测试人员",
};

/** 日志里 targetType 的中文名 */
export const logTargetLabel: Record<string, string> = {
  TASK: "任务",
  DISCUSSION: "协作",
  DOCUMENT: "文档",
  AUTH: "登录",
  USER: "账号",
};

/** 日志里 action 的中文名 */
export const logActionLabel: Record<string, string> = {
  PROGRESS: "更新进度",
  MOVE: "移动任务",
  CREATE: "新建",
  COMMENT: "发表回复",
  UPLOAD: "上传文档",
  REVISE: "修订文档",
  LOGIN: "账号登录",
  LOGIN_FAIL: "登录失败",
  REGISTER: "注册",
  ENABLE: "启用账号",
  DISABLE: "停用账号",
  RESET_PASSWORD: "重置密码",
  CHANGE_ROLE: "修改账号类型",
  DELETE: "删除",
};
