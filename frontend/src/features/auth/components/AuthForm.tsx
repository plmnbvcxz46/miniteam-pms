import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/Separator";
import type { AuthFormState } from "../hooks/useAuthForm";
import styles from "../LoginPage.module.css";

interface AuthFieldsProps {
  form: AuthFormState;
}

function AuthFields({ form }: AuthFieldsProps) {
  const {
    isRegister,
    hasRemembered,
    realName,
    username,
    password,
    handleFieldChange,
    setInputRef,
    fieldError,
  } = form;

  return (
    <>
      {isRegister && (
        <>
          <Field layout="vertical" label="姓名" error={fieldError("realName")}>
            <Input
              autoFocus
              autoComplete="name"
              placeholder="真实姓名"
              ref={setInputRef("realName")}
              value={realName}
              onChange={(e) => handleFieldChange("realName", e.target.value)}
            />
          </Field>
          <Separator variant="dashed" />
        </>
      )}

      <Field layout="vertical" label="账号" error={fieldError("username")}>
        <Input
          mono
          autoFocus={!isRegister && !hasRemembered}
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="账号"
          ref={setInputRef("username")}
          value={username}
          onChange={(e) => handleFieldChange("username", e.target.value)}
        />
      </Field>

      <Separator variant="dashed" />

      <Field layout="vertical" label="密码" error={fieldError("password")}>
        <Input
          type="password"
          autoFocus={!isRegister && hasRemembered}
          autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder="密码"
          ref={setInputRef("password")}
          value={password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
        />
      </Field>
    </>
  );
}

export interface AuthFormProps {
  form: AuthFormState;
}

export function AuthForm({ form }: AuthFormProps) {
  const {
    isRegister,
    remember,
    submitting,
    notice,
    setRemember,
    handleSubmit,
    switchMode,
  } = form;

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      {notice && (
        <Alert variant="inline" tone="info">
          {notice}
        </Alert>
      )}

      <AuthFields form={form} />

      {!isRegister && (
        <Checkbox
          label="记住账号"
          checked={remember}
          onCheckedChange={(checked) => setRemember(checked === true)}
        />
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        loading={submitting}
      >
        {isRegister ? "注册" : "登录"}
      </Button>

      <p className={styles.alt}>
        {isRegister ? "已有账号？" : "没有账号？"}
        <Button
          variant="link"
          onClick={() => switchMode(isRegister ? "login" : "register")}
        >
          {isRegister ? "登录" : "注册"}
        </Button>
      </p>
    </form>
  );
}
