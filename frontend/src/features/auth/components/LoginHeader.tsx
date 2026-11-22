import { Separator } from "../../../components/ui/Separator";
import styles from "./LoginHeader.module.css";

export interface LoginHeaderProps {
  isRegister: boolean;
}

export function LoginHeader({ isRegister }: LoginHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <svg width="28" height="28" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="0" y="0" width="15" height="34" className={styles.logoInk} />
          <rect x="19" y="0" width="15" height="18" className={styles.logoAccent} />
        </svg>
        MINITEAM PMS
      </div>

      <div className={styles.heading}>
        <div className={styles.kicker}>{isRegister ? "SIGN UP" : "SIGN IN"}</div>
        <h1 className={styles.title}>{isRegister ? "注册" : "登录"}</h1>
        <span className={styles.subtitle}>小型软件团队项目管理系统</span>
      </div>

      <Separator variant="double" />
    </header>
  );
}
