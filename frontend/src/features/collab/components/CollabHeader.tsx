import { PageHeader } from "../../../components/patterns/PageHeader";
import { Button } from "../../../components/ui/Button";

interface CollabHeaderProps {
  kicker: string;
  isPast: boolean;
  onOpenNew: () => void;
}

export function CollabHeader({ kicker, isPast, onOpenNew }: CollabHeaderProps) {
  return (
    <PageHeader
      kicker={kicker}
      title="团队"
      accentTitle="协作"
      actions={
        !isPast ? (
          <Button variant="accent" size="md" onClick={onOpenNew}>
            + 发起讨论
          </Button>
        ) : undefined
      }
    />
  );
}
