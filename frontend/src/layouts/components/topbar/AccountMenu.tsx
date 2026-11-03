import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useMe } from "../../../auth/useAuth";
import { useDismiss } from "../../useDismiss";

interface AccountMenuProps {
  /** 个人资料里改过姓名后跟着变 */
  realName: string;
  onOpenProfile: () => void;
}

export default function AccountMenu({ realName, onOpenProfile }: AccountMenuProps) {
  const me = useMe();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  // 打开后焦点放到第一个按钮
  useEffect(() => {
    if (open) firstRef.current?.focus();
  }, [open]);

  return (
    <div className="me-wrap" ref={rootRef}>
      <button
        ref={buttonRef}
        className="me"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`当前账号 ${realName}，个人资料或退出`}
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
      {open && (
        <div className="issues accts">
          <h4>ACCOUNT</h4>
          <div className="list scroll-y">
            <button type="button" aria-current="true" disabled>
              <span className="no">{me.roleName}</span>
              <span className="hd">{realName}</span>
              <span className="tm">{me.user.username}</span>
            </button>
          </div>
          <div className="afoot">
            <button
              ref={firstRef}
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
                void logout();
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
