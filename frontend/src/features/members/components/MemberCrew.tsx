import type { PermKey, ProjectRole } from "../../../shared/types/global";
import type { Member, PermDef } from "../../../shared/types/members";
import CrewLabels from "./CrewLabels";
import MemberColumn from "./MemberColumn";
import styles from "./MemberCrew.module.css";

interface MemberCrewProps {
  members: Member[];
  capacityText: string;
  loadScale: number;
  permDefs: PermDef[];
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  canManageMember: boolean;
  onTogglePerm: (userId: number, key: PermKey) => void;
  onChangeRole: (userId: number, role: ProjectRole) => void;
}

export default function MemberCrew({
  members,
  capacityText,
  loadScale,
  permDefs,
  searchKeyword,
  onSearchChange,
  canManageMember,
  onTogglePerm,
  onChangeRole,
}: MemberCrewProps) {
  const columnCount = Math.max(members.length, 1);
  const pmCount = members.filter((m) => m.projectRole === "PM").length;

  return (
    <div className={styles.scrollWrap}>
      <div
        className={styles.crew}
        style={{
          gridTemplateColumns: `230px repeat(${columnCount}, minmax(150px, 240px))`,
        }}
      >
        <CrewLabels
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          permDefs={permDefs}
          capacityText={capacityText}
        />

        {members.length > 0 ? (
          members.map((member) => (
            <MemberColumn
              key={member.user.id}
              member={member}
              loadScale={loadScale}
              permDefs={permDefs}
              canManageMember={canManageMember}
              // 项目里至少要留一个项目经理，最后一个不能被改成别的角色
              canChangeRole={
                canManageMember && (member.projectRole !== "PM" || pmCount > 1)
              }
              onTogglePerm={(key) => onTogglePerm(member.user.id, key)}
              onChangeRole={(role) => onChangeRole(member.user.id, role)}
            />
          ))
        ) : (
          <div className={styles.emptyCell}>未找到匹配的成员</div>
        )}
      </div>
    </div>
  );
}
