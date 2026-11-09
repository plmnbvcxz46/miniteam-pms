import type { PermDef } from "../types/members";

/** 4 个权限行的标题和说明，顺序即表格行顺序 */
export const permDefs: PermDef[] = [
  { key: "canEditTask", label: "编辑任务", desc: "新建、修改任务和状态" },
  { key: "canEditSchedule", label: "调整排期", desc: "修改工期和前置任务" },
  { key: "canEditDoc", label: "编辑文档", desc: "上传文档和版本，定稿" },
  { key: "canManageMember", label: "管理成员", desc: "邀请成员，修改角色和权限" },
];
