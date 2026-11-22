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

      {/* TODO(阶段 4 第 2 步)：建立 patterns/PageHeader 时，此标题区改为复用 PageHeader 或其子部件（Kicker / PageTitle），不再各写一份，见 frontend/custom-components.md */}
      <div className={styles.heading}>
        <div className={styles.kicker}>{isRegister ? "SIGN UP" : "SIGN IN"}</div>
        <h1 className={styles.title}>{isRegister ? "注册" : "登录"}</h1>
        <span className={styles.subtitle}>小型软件团队项目管理系统</span>
      </div>

      <Separator variant="masthead" />
    </header>
  );
}
