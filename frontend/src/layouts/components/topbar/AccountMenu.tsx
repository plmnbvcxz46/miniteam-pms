import { useCallback, useEffect, useRef, useState } from "react";
import { useAccess } from "../../../access/useAccess";
import { useAuth, useMe } from "../../../auth/useAuth";
import { roleLabel } from "../../../data/global";
import { isSystemAdmin, type Account } from "../../../types/auth";
import { useDismiss } from "../../useDismiss";

interface AccountMenuProps {
  /** 个人资料里改过姓名后跟着变 */
  realName: string;
  onOpenProfile: () => void;
  /** 切换账号前后要做的收尾（关抽屉等）由外壳处理 */
  onSwitch: (userId: number) => void;
}

export default function AccountMenu({
  realName,
  onOpenProfile,
  onSwitch,
}: AccountMenuProps) {
  const me = useMe();
  const { accounts, logout } = useAuth();
  const { roleOf } = useAccess();

  /** 本项目里的角色；系统管理员所有项目都能进、所有权限都有 */
  const describeProjectRole = (account: Account): string => {
    if (account.disabled) return "已停用 · 不可切换";
    if (isSystemAdmin(account)) return "全部项目 · 全部权限";
    const role = roleOf(account.user.id);
    return role ? `本项目 · ${roleLabel[role]}` : "未加入当前项目";
  };
  const [open, setOpen] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [announce, setAnnounce] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  // 打开后焦点放到当前账号那一行
  useEffect(() => {
    if (open) currentRef.current?.focus();
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enabledCount = accounts.filter((a) => !a.disabled).length;

  const closeAndFocus = () => {
    close();
    buttonRef.current?.focus();
  };

  const handlePick = (account: Account) => {
    closeAndFocus();
    if (account.user.id === me.user.id) return;
    onSwitch(account.user.id);
    setAnnounce(`已切换为 ${account.user.realName} · ${account.roleName}`);
    // 顶栏胶囊短暂亮一下橙色细框，不用提示框
    setSwapped(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSwapped(false), 1600);
  };

  return (
    <div className="me-wrap" ref={rootRef}>
      <button
        ref={buttonRef}
        className={swapped ? "me swapped" : "me"}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`当前账号 ${realName}，切换账号或退出`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{realName.slice(0, 1)}</span>
        <em>
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
      <span className="sr" aria-live="polite">
        {announce}
      </span>
      {open && (
        <div className="issues accts">
          <h4>
            ACCOUNTS
            <em>
              {enabledCount}/{accounts.length}
            </em>
          </h4>
          <div className="list scroll-y">
            {accounts.map((account) => {
              const current = account.user.id === me.user.id;
              return (
                <button
                  key={account.user.id}
                  ref={current ? currentRef : undefined}
                  type="button"
                  className={account.disabled ? "off" : undefined}
                  disabled={account.disabled}
                  aria-current={current ? "true" : undefined}
                  onClick={() => handlePick(account)}
                >
                  <span className="no">{account.roleName}</span>
                  <span className="hd">
                    {current ? realName : account.user.realName}
                  </span>
                  <span className="tm">{account.user.username}</span>
                  <span className="dt">{describeProjectRole(account)}</span>
                </button>
              );
            })}
          </div>
          <div className="afoot">
            <button
              type="button"
              className="pfoot"
              onClick={() => {
                close();
                onOpenProfile();
              }}
            >
              个人资料
            </button>
            <button
              type="button"
              className="pfoot out"
              onClick={() => {
                close();
                logout();
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
