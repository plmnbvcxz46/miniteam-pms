import type { PermKey } from "../../../../types/global";
import type { Member, PermDef } from "../../../../types/members";
import CrewLabels from "./CrewLabels";
import MemberColumn from "./MemberColumn";

interface MemberCrewProps {
  /** 成员列表（支持搜索过滤后传入） */
  members: Member[];
  /** 权限行列表配置 */
  permDefs: PermDef[];
  /** 搜索关键字 */
  searchKeyword: string;
  /** 搜索变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 当前用户是否可管理权限 */
  canManageMember: boolean;
  /** 切换权限回调 */
  onTogglePerm: (userId: number, key: PermKey) => void;
}

export default function MemberCrew({
  members,
  permDefs,
  searchKeyword,
  onSearchChange,
  canManageMember,
  onTogglePerm,
}: MemberCrewProps) {
  const columnCount = Math.max(members.length, 1);

  return (
    <div className="scroll-x" style={{ flexShrink: 0 }}>
      <div
        className="crew"
        id="crew"
        style={{
          gridTemplateColumns: `230px repeat(${columnCount}, minmax(150px, 1fr))`,
        }}
      >
        {/* 左侧固定表头行与搜索栏 */}
        <CrewLabels
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          permDefs={permDefs}
        />

        {/* 成员列列表 */}
        {members.length > 0 ? (
          members.map((member) => (
            <MemberColumn
              key={member.user.id}
              member={member}
              permDefs={permDefs}
              canManageMember={canManageMember}
              onTogglePerm={(key) => onTogglePerm(member.user.id, key)}
            />
          ))
        ) : (
          <div
            className="c-who"
            style={{
              gridColumn: "2",
              gridRow: "1 / span 7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--mute)",
              fontSize: "13px",
            }}
          >
            未找到匹配的成员
          </div>
        )}
      </div>
    </div>
  );
}
