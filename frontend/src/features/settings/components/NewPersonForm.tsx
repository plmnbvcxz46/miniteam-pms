import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import type { Role, UserCreate } from "../../../shared/types/settings";
import { useNewPersonForm } from "../hooks/useNewPersonForm";
import { RoleToggle } from "./RoleToggle";
import styles from "./People.module.css";

interface NewPersonFormProps {
  roles: Role[];
  existing: string[];
  onCancel: () => void;
  /** 返回 null 表示成功，否则是要显示的错误 */
  onSubmit: (values: UserCreate) => Promise<string | null>;
}

/** 新增人员：账号、姓名、初始密码、账号类型 */
export function NewPersonForm({
  roles,
  existing,
  onCancel,
  onSubmit,
}: NewPersonFormProps) {
  const form = useNewPersonForm({ roles, existing, onSubmit });

  return (
    <form className={styles.detail} noValidate onSubmit={form.handleSubmit}>
      <h3 className={styles.name}>新增人员</h3>
      <div className={styles.fields}>
        <Field label="账号">
          <Input
            autoFocus
            value={form.username}
            onChange={(e) => form.setUsername(e.target.value)}
          />
        </Field>
        <Separator variant="dashed" />
        <Field label="姓名">
          <Input
            value={form.realName}
            onChange={(e) => form.setRealName(e.target.value)}
          />
        </Field>
        <Separator variant="dashed" />
        <Field label="初始密码">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
          />
        </Field>
        <Separator variant="dashed" />
        <Field label="账号类型" align="top" htmlFor="new-person-role">
          <RoleToggle
            roles={roles}
            roleId={form.roleId}
            onChange={form.setRoleId}
          />
        </Field>
      </div>
      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={form.submitting}>
          新增
        </Button>
        <Button disabled={form.submitting} onClick={onCancel}>
          取消
        </Button>
      </div>
      {form.error && (
        <Alert variant="inline" tone="danger">
          {form.error}
        </Alert>
      )}
    </form>
  );
}
