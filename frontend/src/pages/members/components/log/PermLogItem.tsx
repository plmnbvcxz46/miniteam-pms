import type { Activity } from "../../../../types/global";
import { formatLogDate } from "../../utils";

interface PermLogItemProps {
  /** 权限变更动态对象 */
  log: Activity;
}

export default function PermLogItem({ log }: PermLogItemProps) {
  return (
    <div className="hv" title={log.detail}>
      <b>{formatLogDate(log.createdAt)}</b>
      <span>{log.detail}</span>
    </div>
  );
}
