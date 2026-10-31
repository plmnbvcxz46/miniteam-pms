import { useEffect, useRef } from "react";
import type { Activity } from "../../../../types/global";
import PermLogItem from "./PermLogItem";

interface PermLogProps {
  /** 权限变更记录列表 */
  logs: Activity[];
}

export default function PermLog({ logs }: PermLogProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // 当新增记录时，自动滚动到顶部显示最新动态
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <section className="plogw">
      <div>
        <span className="k">// Logs</span>
        <b>变更记录</b>
      </div>
      <div className="plog" id="perm-log" ref={listRef}>
        {logs.length > 0 ? (
          logs.map((log) => <PermLogItem key={log.id} log={log} />)
        ) : (
          <div
            style={{
              color: "var(--mute)",
              fontSize: "12px",
              padding: "8px 0",
            }}
          >
            暂无变更记录
          </div>
        )}
      </div>
    </section>
  );
}
