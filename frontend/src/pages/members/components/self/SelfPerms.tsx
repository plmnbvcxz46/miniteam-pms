import { permDefs } from "../../../../data/members";
import type { MemberPermissions } from "../../../../types/global";

interface SelfPermsProps {
  permissions: MemberPermissions;
}

export default function SelfPerms({ permissions }: SelfPermsProps) {
  return (
    <section className="pnl me-perm" aria-labelledby="me-perm-h">
      <div className="phd">
        <div>
          <span className="k">// ACCESS</span>
          <h2 id="me-perm-h">我的权限</h2>
        </div>
      </div>
      <dl className="me-perm-list">
        {permDefs.map((def) => {
          const on = permissions[def.key];
          return (
            <div key={def.key} className={on ? "on" : undefined}>
              <dt>{def.label}</dt>
              <dd>
                <i className={`key ${on ? "on" : "dash"}`} aria-hidden="true" />
                {on ? "已开通" : "未开通"}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
