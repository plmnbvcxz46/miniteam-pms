import { BrandMark } from "../../../components/patterns/BrandMark";
import { PageHeader } from "../../../components/patterns/PageHeader";
import { Separator } from "../../../components/ui/Separator";
import styles from "./LoginHeader.module.css";

export interface LoginHeaderProps {
  isRegister: boolean;
}

export function LoginHeader({ isRegister }: LoginHeaderProps) {
  return (
    <header className={styles.header}>
      <BrandMark showWordmark />
      <PageHeader
        as="div"
        kicker={isRegister ? "SIGN UP" : "SIGN IN"}
        title={isRegister ? "注册" : "登录"}
        subtitle="小型软件团队项目管理系统"
        showRule={false}
      />
      <Separator variant="masthead" />
    </header>
  );
}
