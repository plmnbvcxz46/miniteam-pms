import { Panel } from "../../../components/patterns/Panel";
import { roleLabel } from "../../../shared/constants/labels";
import type { ProjectRole, UserBrief } from "../../../shared/types/global";
import styles from "./SelfIdentity.module.css";

interface SelfIdentityProps {
  user: UserBrief;
  position: string | null;
  projectRole: ProjectRole | null;
  skillTags: string[];
}

export default function SelfIdentity({
  user,
  position,
  projectRole,
  skillTags,
}: SelfIdentityProps) {
  return (
    <Panel variant="dark" kicker="// PROFILE" title="基本信息">
      <div className={styles.body}>
        <b className={styles.name}>{user.realName}</b>
        <dl className={styles.kv}>
          <dt>账号</dt>
          <dd>{user.username}</dd>
          <dt>岗位</dt>
          <dd>{position ?? "—"}</dd>
          <dt>角色</dt>
          <dd>{projectRole ? roleLabel[projectRole] : "—"}</dd>
        </dl>
        {skillTags.length > 0 && (
          <ul className={styles.tags} aria-label="技能">
            {skillTags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
