import { useEffect, useState } from "react";
import { logApi } from "../../../services/system";
import type { LogItem } from "../../../shared/types/settings";

const PAGE_SIZE = 50;

/** GET /logs：按时间倒序分页，先取第一页，“加载更多”接着往后取 */
export function useLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    logApi
      .list({ page: 1, size: PAGE_SIZE })
      .then((result) => {
        if (!alive) return;
        setTotal(result.total);
        setLogs(result.list);
      })
      .catch(
        (e: unknown) =>
          alive && setError(e instanceof Error ? e.message : "加载失败"),
      )
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

  return { logs, loading, error, hasMore: logs.length < total, loadMore };
}
