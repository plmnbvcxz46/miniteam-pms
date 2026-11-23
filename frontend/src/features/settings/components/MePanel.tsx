import { useState } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { useProfileForm } from "../hooks/useProfileForm";
import { PasswordForm } from "./PasswordForm";
import { SettingsBlock } from "./SettingsBlock";
import { SkillTags } from "./SkillTags";
import styles from "./Settings.module.css";

/** 个人：资料（姓名、邮箱、技能标签）与修改密码 */
export function MePanel() {
  const form = useProfileForm();
  const [changingPassword, setChangingPassword] = useState(false);

  return (
    <div className={styles.panel}>
      <form noValidate onSubmit={form.handleSave}>
        <SettingsBlock kicker="IDENTITY">
          <Field label="姓名" error={form.errors.name || undefined}>
            <Input
              value={form.realName}
              onChange={(e) => form.setRealName(e.target.value)}
            />
          </Field>
          <Field label="账号" htmlFor="settings-username">
            <code id="settings-username">{form.username}</code>
          </Field>
          <Field label="邮箱" error={form.errors.email || undefined}>
            <Input
              type="email"
              placeholder="可不填"
              value={form.email}
              onChange={(e) => form.setEmail(e.target.value)}
            />
          </Field>
          <Field label="技能标签" align="top" htmlFor="settings-tag-input">
            <SkillTags
              inputId="settings-tag-input"
              tags={form.skillTags}
              input={form.tagInput}
              error={form.errors.tag}
              onInputChange={form.setTagInput}
              onAdd={form.addTag}
              onRemove={form.removeTag}
            />
          </Field>
        </SettingsBlock>
        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={!form.dirty}
            loading={form.saving}
          >
            保存资料
          </Button>
        </div>
        {form.errors.save && (
          <Alert variant="inline" tone="danger">
            {form.errors.save}
          </Alert>
        )}
      </form>
      <SettingsBlock kicker="SECURITY">
        <Field label="密码" align="top" htmlFor="settings-password">
          {changingPassword ? (
            <PasswordForm
              onCancel={() => setChangingPassword(false)}
              onDone={() => setChangingPassword(false)}
            />
          ) : (
            <Button
              id="settings-password"
              onClick={() => setChangingPassword(true)}
            >
              修改密码
            </Button>
          )}
        </Field>
      </SettingsBlock>
    </div>
  );
}
