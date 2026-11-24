import { Panel } from "../../../components/patterns/Panel";
import { permDefs } from "../../../shared/constants/permissions";
import type { MemberPermissions } from "../../../shared/types/global";
import styles from "./SelfPerms.module.css";

interface SelfPermsProps {
  permissions: MemberPermissions;
}

export default function SelfPerms({ permissions }: SelfPermsProps) {
  return (
    <Panel kicker="// ACCESS" title="项目权限">
      <dl className={styles.list}>
        {permDefs.map((def) => {
          const on = permissions[def.key];
          return (
            <div
              key={def.key}
              className={styles.row}
              data-on={on ? "true" : undefined}
            >
              <dt className={styles.label}>{def.label}</dt>
              <dd className={styles.state}>
                <i
                  className={styles.swatch}
                  data-on={on ? "true" : "false"}
                  aria-hidden="true"
                />
                {on ? "已开通" : "未开通"}
              </dd>
            </div>
          );
        })}
      </dl>
    </Panel>
  );
}
