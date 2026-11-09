import { useCallback, useEffect, useState, type ReactNode } from "react";
import { configApi } from "../../api/system";
import { useAuth } from "../auth/useAuth";
import { configs } from "../../shared/constants/mock";
import type { ConfigItem } from "../../shared/types/settings";
import { ConfigContext } from "./ConfigContext";

function toValues(items: ConfigItem[]): Record<string, string> {
  return Object.fromEntries(items.map((c) => [c.key, c.value]));
}

/** 接口还没返回（或没登录）时先用默认值，和数据库里的初始数据一致 */
const defaultValues = toValues(configs);

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const loggedIn = me !== null;

  // 登录后读一次系统参数
  useEffect(() => {
    if (!loggedIn) return;
    let alive = true;
    configApi
      .list()
      .then((items) => alive && setValues((prev) => ({ ...prev, ...toValues(items) })))
      .catch(() => {
        // 读不到就继续用默认值，页面照常可用
      });
    return () => {
      alive = false;
    };
  }, [loggedIn]);

  const save = useCallback(
    async (next: Record<string, string>) => {
      const changed = Object.keys(next).filter((key) => next[key] !== values[key]);
      for (const key of changed) {
        const saved = await configApi.update(key, next[key]);
        // 逐项保存：成功一项就记一项，中途失败时已保存的不会丢
        setValues((prev) => ({ ...prev, [key]: saved.value }));
      }
    },
    [values],
  );

  return (
    <ConfigContext.Provider value={{ values, save }}>{children}</ConfigContext.Provider>
  );
}
