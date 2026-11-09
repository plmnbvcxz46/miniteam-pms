import type { Activity } from "../../../../shared/types/global";
import { formatMonthDay } from "../../../../shared/utils/date";

interface PermLogItemProps {
  /** 权限变更动态对象 */
  log: Activity;
}

export default function PermLogItem({ log }: PermLogItemProps) {
  return (
    <div className="hv" title={log.detail}>
      <b>{formatMonthDay(log.createdAt)}</b>
      <span>{log.detail}</span>
    </div>
  );
}
