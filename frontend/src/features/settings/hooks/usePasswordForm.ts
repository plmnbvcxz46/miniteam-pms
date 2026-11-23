import { useState, type FormEvent } from "react";
import { authApi } from "../../../services/auth";
import { validatePassword } from "../validation";

/** PUT /auth/password：旧密码、新密码、确认 */
export function usePasswordForm(onDone: () => void) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validatePassword({ oldPassword, newPassword, confirm });
    setError(message);
    if (message) return;
    setSubmitting(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改失败");
      setSubmitting(false);
      return;
    }
    onDone();
  };

  return {
    oldPassword,
    newPassword,
    confirm,
    error,
    submitting,
    setOldPassword,
    setNewPassword,
    setConfirm,
    handleSubmit,
  };
}
