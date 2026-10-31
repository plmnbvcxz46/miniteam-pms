import type { Activity } from "../../../../types/global";
import PermLogItem from "./PermLogItem";

interface PermLogProps {
  /** 权限变更记录列表 */
  logs: Activity[];
}

export default function PermLog({ logs }: PermLogProps) {
  return (
    <section className="plogw">
      <div>
        <span className="k">// 变更记录</span>
        <b>权限变更</b>
      </div>
      <div className="plog" id="perm-log">
        {logs.map((log) => (
          <PermLogItem key={log.id} log={log} />
        ))}
      </div>
    </section>
  );
}
