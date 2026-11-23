import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import { userApi } from "../../../services/system";
import type { SystemUser, UserCreate } from "../../../shared/types/settings";
import { messageOf } from "./usePeopleData";

interface Options {
  list: SystemUser[];
  setList: Dispatch<SetStateAction<SystemUser[]>>;
  selected: SystemUser | undefined;
  setSelectedId: (id: number | null) => void;
  setCreating: (creating: boolean) => void;
}

/** 对选中人员的操作：改角色、启停、新增、重置密码、删除；失败用红色 Toast */
export function usePersonActions(o: Options) {
  const toast = useToast();
  const [resetNotice, setResetNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState(false);
  const selected = o.selected;
  const fail = (e: unknown) => toast(messageOf(e), { tone: "danger" });
  const replace = (user: SystemUser) =>
    o.setList((prev) => prev.map((u) => (u.id === user.id ? user : u)));

  // PUT /users/{userId}：改账号类型
  const changeRole = async (roleId: number) => {
    if (!selected || roleId === selected.roleId) return;
    try {
      replace(await userApi.update(selected.id, { roleId }));
    } catch (e) {
      fail(e);
    }
  };

  // PUT /users/{userId}/status
  const changeStatus = async (enabled: boolean) => {
    if (!selected) return;
    try {
      await userApi.setStatus(selected.id, enabled ? 1 : 0);
      replace({ ...selected, status: enabled ? 1 : 0 });
    } catch (e) {
      fail(e);
    }
  };

  // POST /users：返回 null 表示成功，否则是要显示的错误
  const create = async (values: UserCreate): Promise<string | null> => {
    try {
      const user = await userApi.create(values);
      o.setList((prev) => [...prev, user]);
      o.setSelectedId(user.id);
      o.setCreating(false);
      toast("已新增人员");
      return null;
    } catch (e) {
      return messageOf(e);
    }
  };

  // POST /users/{userId}/reset-password：返回新的随机密码，要留在页面上让管理员抄给本人
  const resetPassword = async () => {
    if (!selected) return;
    try {
      const { password } = await userApi.resetPassword(selected.id);
      setResetNotice(`密码已重置为 ${password}，请告知本人`);
    } catch (e) {
      fail(e);
    }
  };

  // DELETE /users/{userId}，由 ConfirmDialog 二次确认后调用
  const remove = async () => {
    if (!selected) return;
    setRemoving(true);
    try {
      await userApi.remove(selected.id);
      const rest = o.list.filter((u) => u.id !== selected.id);
      o.setList(rest);
      o.setSelectedId(rest[0]?.id ?? null);
      setResetNotice("");
      toast("账号已删除");
    } catch (e) {
      fail(e);
    } finally {
      setRemoving(false);
      setConfirmDelete(false);
    }
  };

  return {
    resetNotice,
    clearNotice: () => setResetNotice(""),
    confirmDelete,
    removing,
    setConfirmDelete,
    changeRole,
    changeStatus,
    create,
    resetPassword,
    remove,
  };
}
