import type { PermKey, ProjectRole } from "../../../shared/types/global";
import type { Member, PermDef } from "../../../shared/types/members";
import CrewLabels from "./CrewLabels";
import MemberColumn from "./MemberColumn";

interface MemberCrewProps {
  /** 成员列表（支持搜索过滤后传入） */
  members: Member[];
  /** 每周工时上限的显示文字，如“40”或“32–40” */
  capacityText: string;
  /** 一组成员共用的工时坐标轴最大值（小时） */
  loadScale: number;
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
  /** 修改成员在本项目里的角色 */
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

  return (
    <div className="scroll-x" style={{ flexShrink: 0 }}>
      <div
        className="crew"
        id="crew"
        style={{
          gridTemplateColumns: `230px repeat(${columnCount}, minmax(var(--crew-col-min), var(--crew-col-max)))`,
        }}
      >
        {/* 左侧固定表头行与搜索栏 */}
        <CrewLabels
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          matches={members}
          permDefs={permDefs}
          capacityText={capacityText}
        />

        {/* 成员列列表 */}
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
                canManageMember &&
                (member.projectRole !== "PM" ||
                  members.filter((m) => m.projectRole === "PM").length > 1)
              }
              onTogglePerm={(key) => onTogglePerm(member.user.id, key)}
              onChangeRole={(role) => onChangeRole(member.user.id, role)}
            />
          ))
        ) : (
          <div
            className="c-who t-meta"
            style={{
              gridColumn: "2",
              gridRow: "1 / span 8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            未找到匹配的成员
          </div>
        )}
      </div>
    </div>
  );
}
