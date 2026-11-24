import { LoadBar } from "../../../components/patterns/LoadBar";
import type { WorkloadMember } from "../../../shared/types/reports";
import styles from "./LoadPanel.module.css";

interface LoadRowProps {
  member: WorkloadMember;
  /** 一组成员共用的坐标轴最大值（小时） */
  maxScale: number;
}

export default function LoadRow({ member, maxScale }: LoadRowProps) {
  const isOver = member.weeklyHours > Math.max(member.capacity, 1);

  return (
    <div className={styles.row}>
      <b className={styles.name}>{member.user.realName}</b>
      <LoadBar
        hours={member.weeklyHours}
        capacity={member.capacity}
        maxScale={maxScale}
        label={`${member.user.realName} 本周工时`}
      />
      <span className={styles.value} data-late={isOver ? "true" : undefined}>
        {member.weeklyHours}
      </span>
    </div>
  );
}
