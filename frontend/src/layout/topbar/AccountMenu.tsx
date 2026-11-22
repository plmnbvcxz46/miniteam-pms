import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/DropdownMenu";
import { useAuth, useMe } from "../../state/auth/useAuth";
import styles from "./AccountMenu.module.css";

interface AccountMenuProps {
  /** 个人资料里改过姓名后跟着变 */
  realName: string;
  onOpenProfile: () => void;
}

export default function AccountMenu({
  realName,
  onOpenProfile,
}: AccountMenuProps) {
  const me = useMe();
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={styles.trigger}
          type="button"
          aria-label={`当前账号 ${realName}，个人资料或退出`}
        >
          <span className={styles.avatar}>{realName.slice(0, 1)}</span>
          <em className={styles.identity}>
            {realName}
            <small>
              {me.user.username} · {me.roleName}
            </small>
          </em>
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuLabel>
          ACCOUNT · {me.roleName}
        </DropdownMenuLabel>
        <div className={styles.accountSummary}>
          <span className={styles.accountName}>{realName}</span>
          <span className={styles.accountUser}>{me.user.username}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenProfile}>个人资料</DropdownMenuItem>
        <DropdownMenuItem tone="danger" onSelect={() => void logout()}>
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
