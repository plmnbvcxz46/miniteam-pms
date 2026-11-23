import { useEffect, useState } from "react";
import { roleApi, userApi } from "../../../services/system";
import type { Role, SystemUser } from "../../../shared/types/settings";

/** 人员不多，一次取完，搜索在前端过滤；接口单页最多 100 条 */
const LIST_SIZE = 100;

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败";
}

/** 读取人员名册和系统角色：GET /users、GET /roles */
export function usePeopleData() {
  const [list, setList] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([userApi.list({ size: LIST_SIZE }), roleApi.list()])
      .then(([users, roleList]) => {
        if (!alive) return;
        setList(users.list);
        setRoles(roleList);
        setSelectedId(users.list[0]?.id ?? null);
      })
      .catch((e: unknown) => alive && setLoadError(messageOf(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return {
    list,
    setList,
    roles,
    loading,
    loadError,
    selectedId,
    setSelectedId,
  };
}
