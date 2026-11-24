import { LoadBar } from "../../../components/patterns/LoadBar";
import { Panel } from "../../../components/patterns/Panel";
import { Badge } from "../../../components/ui/Badge";
import styles from "./SelfLoad.module.css";

interface SelfLoadProps {
  hours: number;
  capacity: number;
}

export default function SelfLoad({ hours, capacity }: SelfLoadProps) {
  const isOver = hours > Math.max(capacity, 1);

  return (
    <Panel
      kicker="// HOURS"
      title="本周工时"
      headerRight={
        isOver ? (
          <Badge variant="accent" size="sm">
            超出 {hours - capacity}
          </Badge>
        ) : undefined
      }
    >
      <div className={styles.body}>
        <div className={styles.big} data-over={isOver ? "true" : undefined}>
          {hours}
          <small className={styles.cap}>（{capacity}）</small>
        </div>
        <LoadBar hours={hours} capacity={capacity} variant="detailed" />
      </div>
    </Panel>
  );
}
