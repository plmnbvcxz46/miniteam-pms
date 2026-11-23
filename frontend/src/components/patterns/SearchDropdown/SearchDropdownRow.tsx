import type { ReactNode } from "react";
import styles from "./SearchDropdown.module.css";

/** 单行两栏的常用行内容：左边名称 + 副标题，右边附注 */
export function SearchDropdownRow({
  name,
  sub,
  end,
}: {
  name: ReactNode;
  sub?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <span className={styles.row}>
      <span className={styles.rowMain}>
        <span className={styles.rowName}>{name}</span>
        {sub != null && <span className={styles.rowSub}>{sub}</span>}
      </span>
      {end != null && <span className={styles.rowEnd}>{end}</span>}
    </span>
  );
}
