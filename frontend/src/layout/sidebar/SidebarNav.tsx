import { NavLink } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { useAccess } from "../../state/access/useAccess";
import { navGroups } from "../nav";
import NavIcon from "./NavIcon";
import styles from "./SidebarNav.module.css";

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
          className={styles.group}
          aria-label={group.ariaLabel}
          data-label={group.label}
        >
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} className={styles.item}>
              <NavIcon name={item.icon} />
              {item.to === "/members" && !permissions.canManageMember
                ? "我的信息"
                : item.label}
              {item.badge === "risk" && riskCount > 0 && (
                <Badge variant="solid" size="sm" className={styles.badge}>
                  {riskCount}
                </Badge>
              )}
            </NavLink>
          ))}
          {index === lastGroup && (
            <button
              type="button"
              className={styles.item}
              onClick={onOpenSettings}
            >
              <NavIcon name="settings" />
              系统管理
            </button>
          )}
        </nav>
      ))}
    </>
  );
}
