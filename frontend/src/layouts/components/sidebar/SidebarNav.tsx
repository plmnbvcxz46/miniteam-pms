import { NavLink } from "react-router-dom";
import { useAccess } from "../../../state/access/useAccess";
import { navGroups } from "../../nav";
import NavIcon from "./NavIcon";

interface SidebarNavProps {
  /** 阻塞任务数，显示在“任务”上，为 0 不显示 */
  riskCount: number;
  onOpenSettings: () => void;
}

export default function SidebarNav({ riskCount, onOpenSettings }: SidebarNavProps) {
  const lastGroup = navGroups.length - 1;
  const { permissions } = useAccess();
  return (
    <>
      {navGroups.map((group, index) => (
        <nav
          key={group.ariaLabel}
          className="grp"
          aria-label={group.ariaLabel}
          data-l={group.label}
        >
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <NavIcon name={item.icon} />
              {item.to === "/members" && !permissions.canManageMember
                ? "我的信息"
                : item.label}
              {item.badge === "risk" && riskCount > 0 && (
                <span className="risk">{riskCount}</span>
              )}
            </NavLink>
          ))}
          {index === lastGroup && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenSettings();
              }}
            >
              <NavIcon name="settings" />
              系统管理
            </a>
          )}
        </nav>
      ))}
    </>
  );
}
