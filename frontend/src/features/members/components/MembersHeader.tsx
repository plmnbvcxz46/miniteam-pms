import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";

interface MembersHeaderProps {
  memberCount: number;
  overCapacityCount: number;
  canInvite?: boolean;
  onInviteClick: () => void;
}

export default function MembersHeader({
  memberCount,
  overCapacityCount,
  canInvite = true,
  onInviteClick,
}: MembersHeaderProps) {
  return (
    <PageHeader
      kicker={`${memberCount} 名成员 · 本周 ${overCapacityCount} 人超出工时上限`}
      title="成员"
      accentTitle="权限"
      actions={
        canInvite ? (
          <Button variant="accent" onClick={onInviteClick}>
            + 邀请成员
          </Button>
        ) : undefined
      }
    />
  );
}
