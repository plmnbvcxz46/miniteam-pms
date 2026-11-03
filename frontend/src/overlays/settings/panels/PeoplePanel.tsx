import { useState, type FormEvent } from "react";
import { roles, systemUsers } from "../../../data/settings";
import type { SystemUser, UserCreate } from "../../../types/settings";
import { getProjectToday } from "../../../utils/date";
import Switch from "../components/Switch";

const UNGROUPED = "未分组";

/** 按部门分组，没有部门的放最后 */
function groupByDept(list: SystemUser[]): { dept: string; items: SystemUser[] }[] {
  const groups: { dept: string; items: SystemUser[] }[] = [];
  for (const user of list) {
    const dept = user.dept ?? UNGROUPED;
    const found = groups.find((g) => g.dept === dept);
    if (found) found.items.push(user);
    else groups.push({ dept, items: [user] });
  }
  return groups.sort(
    (a, b) => Number(a.dept === UNGROUPED) - Number(b.dept === UNGROUPED),
  );
}

export default function PeoplePanel() {
  const [list, setList] = useState(systemUsers);
  const [selectedId, setSelectedId] = useState(systemUsers[0].id);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const keyword = query.trim().toLowerCase();
  const visible = list.filter(
    (u) =>
      !keyword ||
      u.realName.toLowerCase().includes(keyword) ||
      u.username.toLowerCase().includes(keyword),
  );
  const selected = list.find((u) => u.id === selectedId) ?? list[0];

  const select = (id: number) => {
    setSelectedId(id);
    setCreating(false);
    setNotice("");
    setConfirmDelete(false);
  };

  // PUT /users/{userId}：改角色
  const changeRole = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setList((prev) =>
      prev.map((u) =>
        u.id === selected.id
          ? { ...u, roleId, roleCode: role.code, roleName: role.name }
          : u,
      ),
    );
  };

  // PUT /users/{userId}/status
  const changeStatus = (enabled: boolean) => {
    setList((prev) =>
      prev.map((u) =>
        u.id === selected.id ? { ...u, status: enabled ? 1 : 0 } : u,
      ),
    );
  };

  // POST /users
  const handleCreate = (values: UserCreate) => {
    const role = roles.find((r) => r.id === values.roleId)!;
    const user: SystemUser = {
      id: Math.max(0, ...list.map((u) => u.id)) + 1,
      username: values.username,
      realName: values.realName,
      dept: values.dept ?? null,
      roleId: role.id,
      roleCode: role.code,
      roleName: role.name,
      email: values.email ?? null,
      skillTags: values.skillTags ?? [],
      weeklyCapacity: values.weeklyCapacity ?? 40,
      status: 1,
      lastLoginAt: null,
      createdAt: `${getProjectToday()} 00:00:00`,
    };
    setList((prev) => [...prev, user]);
    setSelectedId(user.id);
    setCreating(false);
    setNotice("已新增");
  };

  // POST /users/{userId}/reset-password：返回新的随机密码
  const handleResetPassword = () => {
    const password = Math.random().toString(36).slice(2, 10);
    setNotice(`密码已重置为 ${password}，请告知本人`);
  };

  // DELETE /users/{userId}，要点两次
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const rest = list.filter((u) => u.id !== selected.id);
    setList(rest);
    setSelectedId(rest[0]?.id ?? 0);
    setConfirmDelete(false);
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
              onClick={() => {
                setCreating(true);
                setNotice("");
              }}
            >
              新增人员
            </button>
          </div>
          <div className="roster" id="roster">
            {visible.length === 0 && <p className="msg">没有匹配的人员</p>}
            {groupByDept(visible).map((group) => (
              <div className="dept" key={group.dept}>
                <h3>
                  <span>{group.dept}</span>
                  <span>{group.items.length} 人</span>
                </h3>
                {group.items.map((user) => (
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
            ))}
          </div>
        </div>

        <div className="block span2 cl" id="person">
          {creating ? (
            <NewPersonForm
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
                <div className="srow">
                  <span className="lb">部门</span>
                  <div>{selected.dept ?? UNGROUPED}</div>
                </div>
                <div className="srow top">
                  <span className="lb">角色</span>
                  <div className="roles">
                    {roles.map((role) => (
                      <label key={role.id}>
                        <button
                          className="perm"
                          type="button"
                          aria-pressed={role.id === selected.roleId}
                          aria-label={role.name}
                          onClick={() => changeRole(role.id)}
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
                      onChange={changeStatus}
                      texts={["启用", "停用"]}
                    />
                  </div>
                </div>
              </div>
              <div className="acts">
                <button className="btn" type="button" onClick={handleResetPassword}>
                  重置密码
                </button>
                <button className="btn risk" type="button" onClick={handleDelete}>
                  {confirmDelete ? "再点一次确认删除" : "删除账号"}
                </button>
              </div>
              {notice && <p className="msg">{notice}</p>}
            </>
          ) : (
            <p className="msg">没有人员</p>
          )}
        </div>
      </div>
    </section>
  );
}

interface NewPersonFormProps {
  existing: string[];
  onCancel: () => void;
  onSubmit: (values: UserCreate) => void;
}

function NewPersonForm({ existing, onCancel, onSubmit }: NewPersonFormProps) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("");
  const [roleId, setRoleId] = useState(
    roles.find((r) => r.code === "DEV")?.id ?? roles[0].id,
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const account = username.trim();
    if (!account || !realName.trim()) {
      setError("账号和姓名都要填");
      return;
    }
    if (existing.includes(account)) {
      setError("这个账号已经存在");
      return;
    }
    if (password.length < 6) {
      setError("初始密码至少 6 位");
      return;
    }
    onSubmit({
      username: account,
      password,
      realName: realName.trim(),
      dept: dept.trim() || undefined,
      roleId,
    });
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
        <div className="srow">
          <label htmlFor="np-dept">部门</label>
          <div>
            <input
              className="in"
              id="np-dept"
              value={dept}
              placeholder="可不填"
              onChange={(e) => setDept(e.target.value)}
            />
          </div>
        </div>
        <div className="srow top">
          <span className="lb">角色</span>
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
        <button className="btn primary" type="submit">
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
