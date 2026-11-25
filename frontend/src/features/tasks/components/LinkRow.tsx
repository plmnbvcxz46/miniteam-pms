import { ListRow } from "../../../components/patterns/ListRow";
import { Badge } from "../../../components/ui/Badge";

interface LinkRowProps {
  tag: string;
  title: string;
  sub: string;
  state?: string;
  late?: boolean;
  onClick: () => void;
}

export default function LinkRow({
  tag,
  title,
  sub,
  state,
  late = false,
  onClick,
}: LinkRowProps) {
  return (
    <ListRow
      density="compact"
      leading={
        <Badge variant="solid" size="sm">
          {tag}
        </Badge>
      }
      title={title}
      meta={sub || undefined}
      tone={late ? "alert" : "default"}
      trailing={state}
      onClick={onClick}
    />
  );
}
