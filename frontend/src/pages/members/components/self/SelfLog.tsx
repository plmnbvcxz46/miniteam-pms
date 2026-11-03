import type { Activity } from "../../../../types/global";
import PermLogItem from "../log/PermLogItem";

interface SelfLogProps {
  /** 和我有关的变更记录 */
  logs: Activity[];
}

export default function SelfLog({ logs }: SelfLogProps) {
  return (
    <section className="pnl me-log" aria-labelledby="me-log-h">
      <div className="phd">
        <div>
          <span className="k">// LOGS</span>
          <h2 id="me-log-h">我的变更</h2>
        </div>
      </div>
      {logs.length > 0 ? (
        <div
          className="plog me-plog"
          role="region"
          aria-labelledby="me-log-h"
          tabIndex={0}
        >
          {logs.map((log) => (
            <PermLogItem key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <div className="me-empty">暂无变更记录</div>
      )}
    </section>
  );
}
