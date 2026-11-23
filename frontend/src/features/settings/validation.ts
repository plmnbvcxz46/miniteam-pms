/**
 * 设置里各个表单的前端校验。规则和后端一致，只返回要给用户看的提示，没问题返回空串。
 */
import type { UserCreate } from "../../shared/types/settings";
import { daysBetween } from "../../shared/utils/date";

/** 技能标签：每个最长 12 个字，最多 10 个 */
export const MAX_TAG_LENGTH = 12;
export const MAX_TAGS = 10;

/** 添加一个技能标签：返回新的标签列表和要显示的提示（React 和 react 算同一个） */
export function addSkillTag(
  tags: string[],
  tag: string,
): { tags: string[]; error: string } {
  if (tag.length > MAX_TAG_LENGTH) {
    return { tags, error: `标签最长 ${MAX_TAG_LENGTH} 个字` };
  }
  if (tags.length >= MAX_TAGS) {
    return { tags, error: `最多 ${MAX_TAGS} 个标签` };
  }
  const exists = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  return { tags: exists ? tags : [...tags, tag], error: "" };
}

export function validateName(name: string): string {
  if (!name) return "姓名不能为空";
  return name.length > 32 ? "姓名最长 32 个字" : "";
}

export function validateEmail(email: string): string {
  return email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? "邮箱格式不对"
    : "";
}

export interface PasswordInput {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export function validatePassword(input: PasswordInput): string {
  if (!input.oldPassword) return "填写旧密码";
  if (input.newPassword.length < 6) return "新密码至少 6 位";
  if (input.newPassword.length > 64) return "新密码最长 64 位";
  if (input.newPassword !== input.confirm) return "两次输入的新密码不一致";
  return "";
}

/** 新增人员；existing 是已有账号，用来查重 */
export function validateNewPerson(
  values: Pick<UserCreate, "username" | "realName" | "password">,
  existing: string[],
): string {
  if (!values.username || !values.realName) return "账号和姓名都要填";
  if (values.username.length < 3 || values.username.length > 32) {
    return "账号要 3 到 32 个字符";
  }
  if (values.realName.length > 32) return "姓名最长 32 个字";
  if (existing.includes(values.username)) return "这个账号已经存在";
  if (values.password.length < 6 || values.password.length > 64) {
    return "初始密码要 6 到 64 位";
  }
  return "";
}

export interface ProjectInput {
  name: string;
  description: string;
  startDate: string;
  planEnd: string;
}

/** 名称 ≤64、说明 ≤500；返回 [名称相关提示, 日期相关提示] */
export function validateProject(input: ProjectInput): [string, string] {
  const name = input.name.trim();
  const nameMsg = !name
    ? "项目名称不能为空"
    : name.length > 64
      ? "项目名称不能超过 64 个字"
      : input.description.trim().length > 500
        ? "项目说明不能超过 500 个字"
        : "";
  const { startDate, planEnd } = input;
  const dateMsg =
    !startDate || !planEnd
      ? "开始日期和计划结束日期都要填"
      : planEnd < startDate
        ? "计划结束日期不能早于开始日期"
        : daysBetween(startDate, planEnd) > 3650
          ? "项目时间跨度不能超过 10 年"
          : "";
  return [nameMsg, dateMsg];
}

interface ParamConfig {
  key: string;
  remark: string | null;
}

/** 权重之和允许的误差 */
const WEIGHT_EPSILON = 0.001;

export function weightSumOf(
  weightConfigs: ParamConfig[],
  values: Record<string, string>,
): number {
  return weightConfigs.reduce(
    (sum, c) => sum + (Number(values[c.key]) || 0),
    0,
  );
}

export function isWeightSumOk(sum: number): boolean {
  return Math.abs(sum - 1) <= WEIGHT_EPSILON;
}

/** 系统参数逐项校验：四个权重、关键路径系数、两个整数参数 */
export function validateParams(
  weightConfigs: ParamConfig[],
  values: Record<string, string>,
  nameOf: (key: string) => string,
): string {
  const valueOf = (key: string) => values[key] ?? "";
  const badWeight = weightConfigs.find((c) => {
    const n = Number(valueOf(c.key));
    return valueOf(c.key).trim() === "" || Number.isNaN(n) || n < 0 || n > 1;
  });
  if (badWeight) return `${badWeight.remark}权重要填 0 到 1 之间的数`;
  const sum = weightSumOf(weightConfigs, values);
  if (!isWeightSumOk(sum)) {
    return `四个优先级权重之和须为 1，现在是 ${sum.toFixed(2)}`;
  }
  const alpha = Number(valueOf("priority.alpha"));
  if (
    valueOf("priority.alpha").trim() === "" ||
    Number.isNaN(alpha) ||
    alpha < 0
  ) {
    return "关键路径加权系数要填不小于 0 的数";
  }
  const badInteger = ["priority.top_n", "member.weekly_capacity"].find(
    (key) => {
      const n = Number(valueOf(key));
      return !Number.isInteger(n) || n <= 0;
    },
  );
  return badInteger ? `${nameOf(badInteger)}要填大于 0 的整数` : "";
}
