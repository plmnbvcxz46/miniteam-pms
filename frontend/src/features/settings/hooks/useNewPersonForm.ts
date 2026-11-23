import { useState, type FormEvent } from "react";
import type { Role, UserCreate } from "../../../shared/types/settings";
import { validateNewPerson } from "../validation";

interface Options {
  roles: Role[];
  /** 已有账号，用来查重 */
  existing: string[];
  /** 返回 null 表示成功，否则是要显示的错误 */
  onSubmit: (values: UserCreate) => Promise<string | null>;
}

/** 新增人员表单：账号、姓名、初始密码、账号类型 */
export function useNewPersonForm({ roles, existing, onSubmit }: Options) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(
    roles.find((r) => r.code === "USER")?.id ?? roles[0].id,
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const values = {
      username: username.trim(),
      realName: realName.trim(),
      password,
    };
    const message = validateNewPerson(values, existing);
    setError(message);
    if (message) return;
    setSubmitting(true);
    const failure = await onSubmit({ ...values, roleId });
    setSubmitting(false);
    if (failure) setError(failure);
  };

  return {
    username,
    realName,
    password,
    roleId,
    error,
    submitting,
    setUsername,
    setRealName,
    setPassword,
    setRoleId,
    handleSubmit,
  };
}
