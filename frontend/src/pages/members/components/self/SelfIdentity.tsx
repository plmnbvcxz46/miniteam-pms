import { roleLabel } from "../../../../shared/constants/labels";
import type { ProjectRole, UserBrief } from "../../../../shared/types/global";

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
    <section className="pnl dark me-id" aria-labelledby="me-id-h">
      <div className="phd">
        <div>
          <span className="k t-kicker">// PROFILE</span>
          <h2 className="t-section-title" id="me-id-h">基本信息</h2>
        </div>
      </div>
      <div className="me-id-body">
        <b className="me-name">{user.realName}</b>
        <dl className="me-kv">
          <dt>账号</dt>
          <dd>{user.username}</dd>
          <dt>岗位</dt>
          <dd>{position ?? "—"}</dd>
          <dt>角色</dt>
          <dd>{projectRole ? roleLabel[projectRole] : "—"}</dd>
        </dl>
        {skillTags.length > 0 && (
          <ul className="me-tags" aria-label="技能">
            {skillTags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
