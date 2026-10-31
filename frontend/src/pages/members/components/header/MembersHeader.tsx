interface MembersHeaderProps {
  /** 成员总数 */
  memberCount: number;
  /** 超出工时上限人数 */
  overCapacityCount: number;
  /** 是否拥有邀请成员权限 */
  canInvite?: boolean;
  /** 点击邀请按钮回调 */
  onInviteClick: () => void;
}

export default function MembersHeader({
  memberCount,
  overCapacityCount,
  canInvite = true,
  onInviteClick,
}: MembersHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="mb-kicker">
          [ {memberCount} 名成员 · 本周 {overCapacityCount} 人超出工时上限 ]
        </div>
        <h1 className="vt">
          成员<em>权限</em>
        </h1>
      </div>
      <div className="va">
        <button
          className="btn go"
          type="button"
          data-form="member"
          disabled={!canInvite}
          onClick={onInviteClick}
        >
          + 邀请成员
        </button>
      </div>
    </div>
  );
}

