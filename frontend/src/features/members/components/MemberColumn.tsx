import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select";
import { Switch } from "../../../components/ui/Switch";
import { roleLabel } from "../../../shared/constants/labels";
import type { PermKey, ProjectRole } from "../../../shared/types/global";
import type { Member, PermDef } from "../../../shared/types/members";
import styles from "./MemberCrew.module.css";
import MemberLoad from "./MemberLoad";

interface MemberColumnProps {
  member: Member;
  loadScale: number;
  permDefs: PermDef[];
  canManageMember: boolean;
  canChangeRole: boolean;
  onTogglePerm: (key: PermKey) => void;
  onChangeRole: (role: ProjectRole) => void;
}

function MemberIdentityCell({
  member,
  roleName,
}: {
  member: Member;
  roleName: string;
}) {
  return (
    <div
      className={`${styles.cell} ${styles.whoCell}`}
      data-hot={member.overCapacity ? "true" : undefined}
    >
      <b className={styles.whoName} title={member.user.realName}>
        {member.user.realName}
      </b>
      <span
        className={styles.whoMeta}
        title={`${roleName} · ${member.user.username}`}
      >
        {roleName} <em className={styles.whoUser}>· {member.user.username}</em>
      </span>
    </div>
  );
}

export default function MemberColumn({
  member,
  loadScale,
  permDefs,
  canManageMember,
  canChangeRole,
  onTogglePerm,
  onChangeRole,
}: MemberColumnProps) {
  const isPm = member.projectRole === "PM";
  const roleName = member.position || roleLabel[member.projectRole];

  return (
    <>
      <MemberIdentityCell member={member} roleName={roleName} />

      <MemberLoad
        memberName={member.user.realName}
        weeklyHours={member.weeklyHours}
        weeklyCapacity={member.weeklyCapacity}
        loadScale={loadScale}
        overCapacity={member.overCapacity}
      />

      <div className={`${styles.cell} ${styles.countCell}`}>
        {member.taskCount} <small className={styles.countUnit}>项</small>
      </div>

      <div className={`${styles.cell} ${styles.roleCell}`}>
        {canChangeRole ? (
          <Select
            value={member.projectRole}
            onValueChange={(val) => onChangeRole(val as ProjectRole)}
          >
            <SelectTrigger aria-label={`${member.user.realName} 在本项目里的角色`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(roleLabel) as ProjectRole[]).map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabel[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span>{roleLabel[member.projectRole]}</span>
        )}
      </div>

      {permDefs.map((def, idx) => {
        const isLast = idx === permDefs.length - 1;
        const hasPerm = Boolean(member[def.key]);
        const isDisabled = !canManageMember || isPm;

        return (
          <div
            key={def.key}
            className={`${styles.cell} ${styles.permCell}`}
            data-last={isLast ? "true" : undefined}
          >
            <Switch
              variant="track"
              checked={hasPerm}
              disabled={isDisabled}
              aria-label={`${member.user.realName} ${def.label}：${hasPerm ? "有" : "无"}`}
              onCheckedChange={() => onTogglePerm(def.key)}
            />
          </div>
        );
      })}
    </>
  );
}
