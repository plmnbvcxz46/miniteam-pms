export const sections = [
  { id: "me", group: "我的", name: "个人" },
  { id: "proj", group: "本项目", name: "刊物规则" },
  { id: "people", group: "系统", name: "人员" },
  { id: "roles", group: "系统", name: "角色与权限" },
  { id: "dict", group: "系统", name: "字典" },
  { id: "logs", group: "系统", name: "日志" },
  { id: "params", group: "系统", name: "系统参数" },
] as const;

export type SectionId = (typeof sections)[number]["id"];
export const groups = ["我的", "本项目", "系统"];
