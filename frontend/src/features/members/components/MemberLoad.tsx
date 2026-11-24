import { LoadBar } from "../../../components/patterns/LoadBar";
import styles from "./MemberCrew.module.css";

interface MemberLoadProps {
  memberName: string;
  weeklyHours: number;
  weeklyCapacity: number;
  loadScale: number;
  overCapacity?: boolean;
}

export default function MemberLoad({
  memberName,
  weeklyHours,
  weeklyCapacity,
  loadScale,
  overCapacity,
}: MemberLoadProps) {
  const isOver = overCapacity ?? weeklyHours > weeklyCapacity;

  return (
    <div className={`${styles.cell} ${styles.loadCell}`}>
      <div
        className={styles.loadNumber}
        data-late={isOver ? "true" : undefined}
      >
        {weeklyHours}
      </div>
      <LoadBar
        hours={weeklyHours}
        capacity={weeklyCapacity}
        maxScale={loadScale}
        label={`${memberName} 本周工时`}
      />
    </div>
  );
}
