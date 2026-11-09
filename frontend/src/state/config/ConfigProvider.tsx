import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { configApi } from "../../api/system";
import { useAuth } from "../auth/useAuth";
import type { ConfigItem } from "../../shared/types/settings";
import { ConfigContext, type ConfigState } from "./ConfigContext";

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [status, setStatus] = useState<ConfigState["status"]>("loading");
  const [error, setError] = useState("");
  const loggedIn = me !== null;

  // 登录后读一次系统参数
  useEffect(() => {
    if (!loggedIn) return;
    let alive = true;
    configApi
      .list()
      .then((list) => {
        if (!alive) return;
        setItems(list);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "读取系统参数失败");
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [loggedIn]);

  const values = useMemo(
    () => Object.fromEntries(items.map((c) => [c.key, c.value])),
    [items],
  );

  const save = useCallback(
    async (next: Record<string, string>) => {
      const changed = Object.keys(next).filter((key) => next[key] !== values[key]);
      for (const key of changed) {
        const saved = await configApi.update(key, next[key]);
        // 逐项保存：成功一项就记一项，中途失败时已保存的不会丢
        setItems((prev) => prev.map((c) => (c.key === key ? saved : c)));
      }
    },
    [values],
  );

  return (
    <ConfigContext.Provider value={{ items, values, status, error, save }}>
      {children}
    </ConfigContext.Provider>
  );
}
