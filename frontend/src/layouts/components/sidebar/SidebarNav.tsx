import { NavLink } from "react-router-dom";
import { navGroups } from "../../nav";

interface SidebarNavProps {
  /** 阻塞任务数，显示在“任务”上，为 0 不显示 */
  riskCount: number;
  onOpenSettings: () => void;
}

export default function SidebarNav({ riskCount, onOpenSettings }: SidebarNavProps) {
  const lastGroup = navGroups.length - 1;
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
              {item.label}
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
              系统管理
            </a>
          )}
        </nav>
      ))}
    </>
  );
}
