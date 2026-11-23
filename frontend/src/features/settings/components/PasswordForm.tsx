import { useToast } from "../../../components/patterns/ToastHost";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { usePasswordForm } from "../hooks/usePasswordForm";
import styles from "./Settings.module.css";

interface PasswordFormProps {
  onCancel: () => void;
  onDone: () => void;
}

/** 修改密码：旧密码、新密码、再输一次 */
export function PasswordForm({ onCancel, onDone }: PasswordFormProps) {
  const toast = useToast();
  const form = usePasswordForm(() => {
    toast("密码已修改");
    onDone();
  });

  return (
    <form className={styles.stack} noValidate onSubmit={form.handleSubmit}>
      <div className={styles.inline}>
        <Input
          size="sm"
          className={styles.narrowInput}
          type="password"
          autoFocus
          placeholder="旧密码"
          aria-label="旧密码"
          value={form.oldPassword}
          onChange={(e) => form.setOldPassword(e.target.value)}
        />
        <Input
          size="sm"
          className={styles.narrowInput}
          type="password"
          placeholder="新密码"
          aria-label="新密码"
          value={form.newPassword}
          onChange={(e) => form.setNewPassword(e.target.value)}
        />
        <Input
          size="sm"
          className={styles.narrowInput}
          type="password"
          placeholder="再输一次"
          aria-label="确认新密码"
          value={form.confirm}
          onChange={(e) => form.setConfirm(e.target.value)}
        />
      </div>
      <div className={styles.inline}>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={form.submitting}
        >
          确认修改
        </Button>
        <Button size="sm" disabled={form.submitting} onClick={onCancel}>
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
