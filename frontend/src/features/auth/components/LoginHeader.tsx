import { BrandMark } from "../../../components/patterns/BrandMark";
import { Separator } from "../../../components/ui/Separator";
import styles from "./LoginHeader.module.css";

export interface LoginHeaderProps {
  isRegister: boolean;
}

export function LoginHeader({ isRegister }: LoginHeaderProps) {
  return (
    <header className={styles.header}>
      <BrandMark showWordmark />

      <div className={styles.heading}>
        <div className={styles.kicker}>{isRegister ? "SIGN UP" : "SIGN IN"}</div>
        <h1 className={styles.title}>{isRegister ? "注册" : "登录"}</h1>
        <span className={styles.subtitle}>小型软件团队项目管理系统</span>
      </div>

      <Separator variant="masthead" />
    </header>
  );
}
