import type { SystemUser } from "../../../shared/types/settings";
import styles from "./People.module.css";

interface PeopleRosterProps {
  users: SystemUser[];
  /** 当前选中的人；新增人员时为 null */
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** 人员名册：每人一行（姓名 + 账号），停用的变灰，选中的反白 */
export function PeopleRoster({
  users,
  selectedId,
  onSelect,
}: PeopleRosterProps) {
  return (
    <div className={styles.roster}>
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          className={styles.person}
          data-off={user.status === 1 ? undefined : "true"}
          aria-current={user.id === selectedId ? "true" : undefined}
          onClick={() => onSelect(user.id)}
        >
          <span>{user.realName}</span>
          <code>{user.username}</code>
        </button>
      ))}
    </div>
  );
}
