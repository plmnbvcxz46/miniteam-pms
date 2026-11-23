import { useState } from "react";
import { useMe } from "../../../state/auth/useAuth";
import { usePeopleData } from "./usePeopleData";
import { usePersonActions } from "./usePersonActions";

/** 人员名册：读取、搜索过滤、选中，以及对选中人员的操作 */
export function usePeople() {
  const me = useMe();
  const data = usePeopleData();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const selected =
    data.list.find((u) => u.id === data.selectedId) ?? data.list[0];
  const actions = usePersonActions({
    list: data.list,
    setList: data.setList,
    selected,
    setSelectedId: data.setSelectedId,
    setCreating,
  });

  const keyword = query.trim().toLowerCase();
  const visible = data.list.filter(
    (u) =>
      !keyword ||
      u.realName.toLowerCase().includes(keyword) ||
      u.username.toLowerCase().includes(keyword),
  );

  return {
    ...actions,
    list: data.list,
    roles: data.roles,
    loading: data.loading,
    loadError: data.loadError,
    visible,
    selected,
    isSelf: selected?.id === me.user.id,
    query,
    creating,
    setQuery,
    setCreating: (v: boolean) => {
      setCreating(v);
      actions.clearNotice();
    },
    select: (id: number) => {
      data.setSelectedId(id);
      setCreating(false);
      actions.clearNotice();
    },
  };
}
