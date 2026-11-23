import { ConfirmDialog } from "../../../components/patterns/ConfirmDialog";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Separator } from "../../../components/ui/Separator";
import { Switch } from "../../../components/ui/Switch";
import type { Role, SystemUser } from "../../../shared/types/settings";
import { RoleToggle } from "./RoleToggle";
import styles from "./People.module.css";

interface PersonDetailProps {
  user: SystemUser;
  roles: Role[];
  /** 当前登录的就是这个人：不能改自己的类型、不能删自己 */
  isSelf: boolean;
  resetNotice: string;
  confirmDelete: boolean;
  removing: boolean;
  onChangeRole: (roleId: number) => void;
  onChangeStatus: (enabled: boolean) => void;
  onResetPassword: () => void;
  onConfirmDeleteChange: (open: boolean) => void;
  onRemove: () => void;
}

/** 选中人员的详情：账号、账号类型、启停，以及重置密码和删除 */
export function PersonDetail(props: PersonDetailProps) {
  const { user, isSelf } = props;
  return (
    <div className={styles.detail}>
      <h3 className={styles.name}>{user.realName}</h3>
      <div className={styles.fields}>
        <Field label="账号" htmlFor="person-username">
          <code id="person-username">{user.username}</code>
        </Field>
        <Separator variant="dashed" />
        <Field label="账号类型" align="top" htmlFor="person-role">
          <RoleToggle
            roles={props.roles}
            roleId={user.roleId}
            disabled={isSelf}
            onChange={props.onChangeRole}
          />
        </Field>
        <Separator variant="dashed" />
        <Field label="状态" htmlFor="person-status">
          <Switch
            id="person-status"
            variant="segmented"
            checked={user.status === 1}
            onCheckedChange={props.onChangeStatus}
          />
        </Field>
      </div>
      <div className={styles.actions}>
        <Button onClick={props.onResetPassword}>重置密码</Button>
        <Button
          variant="danger"
          disabled={isSelf}
          onClick={() => props.onConfirmDeleteChange(true)}
        >
          删除账号
        </Button>
      </div>
      {props.resetNotice && (
        <Alert variant="inline" tone="info">
          {props.resetNotice}
        </Alert>
      )}
      <ConfirmDialog
        open={props.confirmDelete}
        onOpenChange={props.onConfirmDeleteChange}
        title={`删除账号「${user.realName}」？`}
        description="删除后这个账号不能再登录，且无法恢复。"
        confirmLabel="确认删除"
        loading={props.removing}
        onConfirm={props.onRemove}
      />
    </div>
  );
}
