import { AuthForm } from "./components/AuthForm";
import { LoginHeader } from "./components/LoginHeader";
import { useAuthForm } from "./hooks/useAuthForm";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const form = useAuthForm();

  return (
    <main className={styles.page}>
      <div className={styles.col}>
        <LoginHeader isRegister={form.isRegister} />
        <AuthForm form={form} />
      </div>
    </main>
  );
}
