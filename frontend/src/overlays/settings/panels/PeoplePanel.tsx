import { useEffect, useState, type FormEvent } from "react";
import { roleApi, userApi } from "../../../api/system";
import { useMe } from "../../../auth/useAuth";
import type { Role, SystemUser, UserCreate } from "../../../types/settings";
import Switch from "../components/Switch";

/** 人员不多，一次取完，搜索在前端过滤；接口单页最多 100 条 */
const LIST_SIZE = 100;

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "操作失败";
}

export default function PeoplePanel() {
  const me = useMe();
  const [list, setList] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // GET /users、GET /roles
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

  const keyword = query.trim().toLowerCase();
  const visible = list.filter(
    (u) =>
      !keyword ||
      u.realName.toLowerCase().includes(keyword) ||
      u.username.toLowerCase().includes(keyword),
  );
  const selected = list.find((u) => u.id === selectedId) ?? list[0];
  const isSelf = selected?.id === me.user.id;

  const select = (id: number) => {
    setSelectedId(id);
    setCreating(false);
    setNotice("");
    setConfirmDelete(false);
  };

  const replace = (user: SystemUser) =>
    setList((prev) => prev.map((u) => (u.id === user.id ? user : u)));

  // PUT /users/{userId}：改账号类型
  const changeRole = async (roleId: number) => {
    if (roleId === selected.roleId) return;
    setNotice("");
    try {
      replace(await userApi.update(selected.id, { roleId }));
    } catch (e) {
      setNotice(messageOf(e));
    }
  };

  // PUT /users/{userId}/status
  const changeStatus = async (enabled: boolean) => {
    setNotice("");
    try {
      await userApi.setStatus(selected.id, enabled ? 1 : 0);
      replace({ ...selected, status: enabled ? 1 : 0 });
    } catch (e) {
      setNotice(messageOf(e));
    }
  };

  // POST /users
  const handleCreate = async (values: UserCreate): Promise<string | null> => {
    try {
      const user = await userApi.create(values);
      setList((prev) => [...prev, user]);
      setSelectedId(user.id);
      setCreating(false);
      setNotice("已新增");
      return null;
    } catch (e) {
      return messageOf(e);
    }
  };

  // POST /users/{userId}/reset-password：返回新的随机密码
  const handleResetPassword = async () => {
    try {
      const { password } = await userApi.resetPassword(selected.id);
      setNotice(`密码已重置为 ${password}，请告知本人`);
    } catch (e) {
      setNotice(messageOf(e));
    }
  };

  // DELETE /users/{userId}，要点两次
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await userApi.remove(selected.id);
    } catch (e) {
      setConfirmDelete(false);
      setNotice(messageOf(e));
      return;
    }
    const rest = list.filter((u) => u.id !== selected.id);
    setList(rest);
    setSelectedId(rest[0]?.id ?? null);
    setConfirmDelete(false);
    setNotice("");
  };

  return (
    <section className="ss" id="ss-people">
      <div className="g4">
        <div className="block span2">
          <div className="toolbar">
            <label className="field" htmlFor="pq">
              搜索
              <input
                id="pq"
                type="search"
                placeholder="姓名或账号"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              className="btn primary"
              type="button"
              disabled={loading || roles.length === 0}
              onClick={() => {
                setCreating(true);
                setNotice("");
              }}
            >
              新增人员
            </button>
          </div>
          <div className="roster" id="roster">
            {loading && <p className="msg">加载中…</p>}
            {loadError && <p className="msg err">{loadError}</p>}
            {!loading && !loadError && visible.length === 0 && (
              <p className="msg">没有匹配的人员</p>
            )}
            {visible.map((user) => (
              <button
                key={user.id}
                type="button"
                className={user.status === 1 ? "pp" : "pp off"}
                aria-current={
                  !creating && user.id === selected?.id ? "true" : undefined
                }
                onClick={() => select(user.id)}
              >
                <span>{user.realName}</span>
                <code>{user.username}</code>
              </button>
            ))}
          </div>
        </div>

        <div className="block span2 cl" id="person">
          {creating ? (
            <NewPersonForm
              roles={roles}
              existing={list.map((u) => u.username)}
              onCancel={() => setCreating(false)}
              onSubmit={handleCreate}
            />
          ) : selected ? (
            <>
              <h3 className="who-h">{selected.realName}</h3>
              <div className="rows">
                <div className="srow">
                  <span className="lb">账号</span>
                  <div>
                    <code>{selected.username}</code>
                  </div>
                </div>
                <div className="srow top">
                  <span className="lb">账号类型</span>
                  <div className="roles">
                    {roles.map((role) => (
                      <label key={role.id}>
                        <button
                          className="perm"
                          type="button"
                          aria-pressed={role.id === selected.roleId}
                          aria-label={role.name}
                          disabled={isSelf}
                          onClick={() => void changeRole(role.id)}
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="srow">
                  <span className="lb">状态</span>
                  <div>
                    <Switch
                      label="账号状态"
                      value={selected.status === 1}
                      onChange={(enabled) => void changeStatus(enabled)}
                      texts={["启用", "停用"]}
                    />
                  </div>
                </div>
              </div>
              <div className="acts">
                <button
                  className="btn"
                  type="button"
                  onClick={() => void handleResetPassword()}
                >
                  重置密码
                </button>
                <button
                  className="btn risk"
                  type="button"
                  disabled={isSelf}
                  onClick={() => void handleDelete()}
                >
                  {confirmDelete ? "再点一次确认删除" : "删除账号"}
                </button>
              </div>
              {notice && <p className="msg">{notice}</p>}
            </>
          ) : (
            !loading && <p className="msg">没有人员</p>
          )}
        </div>
      </div>
    </section>
  );
}

interface NewPersonFormProps {
  roles: Role[];
  existing: string[];
  onCancel: () => void;
  /** 返回 null 表示成功，否则是要显示的错误 */
  onSubmit: (values: UserCreate) => Promise<string | null>;
}

function NewPersonForm({ roles, existing, onCancel, onSubmit }: NewPersonFormProps) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(
    roles.find((r) => r.code === "USER")?.id ?? roles[0].id,
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const account = username.trim();
    if (!account || !realName.trim()) {
      setError("账号和姓名都要填");
      return;
    }
    if (account.length < 3 || account.length > 32) {
      setError("账号要 3 到 32 个字符");
      return;
    }
    if (realName.trim().length > 32) {
      setError("姓名最长 32 个字");
      return;
    }
    if (existing.includes(account)) {
      setError("这个账号已经存在");
      return;
    }
    if (password.length < 6 || password.length > 64) {
      setError("初始密码要 6 到 64 位");
      return;
    }
    setSubmitting(true);
    const failure = await onSubmit({
      username: account,
      password,
      realName: realName.trim(),
      roleId,
    });
    setSubmitting(false);
    if (failure) setError(failure);
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <h3 className="who-h">新增人员</h3>
      <div className="rows">
        <div className="srow">
          <label htmlFor="np-account">账号</label>
          <div>
            <input
              className="in"
              id="np-account"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="srow">
          <label htmlFor="np-name">姓名</label>
          <div>
            <input
              className="in"
              id="np-name"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
          </div>
        </div>
        <div className="srow">
          <label htmlFor="np-pass">初始密码</label>
          <div>
            <input
              className="in"
              id="np-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="srow top">
          <span className="lb">账号类型</span>
          <div className="roles">
            {roles.map((role) => (
              <label key={role.id}>
                <button
                  className="perm"
                  type="button"
                  aria-pressed={role.id === roleId}
                  aria-label={role.name}
                  onClick={() => setRoleId(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="acts">
        <button className="btn primary" type="submit" disabled={submitting}>
          新增
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          取消
        </button>
      </div>
      {error && <p className="msg err">{error}</p>}
    </form>
  );
}
