import { useEffect, useState } from "react";
import { logApi } from "../../../api/system";
import { logActionLabel, logTargetLabel } from "../../../data/settings";
import type { LogItem } from "../../../types/settings";
import { groupLogsByDay } from "../utils";

const PAGE_SIZE = 50;

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET /logs：按时间倒序分页，先取第一页，“加载更多”接着往后取
  useEffect(() => {
    let alive = true;
    logApi
      .list({ page: 1, size: PAGE_SIZE })
      .then((result) => {
        if (!alive) return;
        setTotal(result.total);
        setLogs(result.list);
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = async () => {
    setLoading(true);
    setError("");
    try {
      const page = Math.floor(logs.length / PAGE_SIZE) + 1;
      const result = await logApi.list({ page, size: PAGE_SIZE });
      setTotal(result.total);
      setLogs((prev) => [...prev, ...result.list]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const days = groupLogsByDay(logs);
  const hasMore = logs.length < total;

  return (
    <section className="ss" id="ss-logs">
      {!loading && !error && days.length === 0 && <p className="msg">没有日志</p>}
      {days.map((day) => (
        <div className="logday" key={day.day}>
          <h3>{day.day}</h3>
          {day.items.map((log) => (
            <div className="lg" key={log.id}>
              <time>{log.createdAt.slice(11, 16)}</time>
              <span>{log.user?.realName ?? "系统"}</span>
              <p>
                {logTargetLabel[log.targetType] ?? log.targetType} ·{" "}
                {logActionLabel[log.action] ?? log.action}
                {log.detail && (
                  <>
                    {" "}
                    <em>{log.detail}</em>
                  </>
                )}
              </p>
              <b>{log.ip}</b>
            </div>
          ))}
        </div>
      ))}
      {loading && <p className="msg">加载中…</p>}
      {error && <p className="msg err">{error}</p>}
      {!loading && hasMore && (
        <div className="acts">
          <button className="btn" type="button" onClick={() => void loadMore()}>
            加载更多
          </button>
        </div>
      )}
    </section>
  );
}
