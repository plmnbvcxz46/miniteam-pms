import { useState } from "react";
import { permissions, roles as initialRoles } from "../../../data/settings";
import { getPermLevel, groupPermissions } from "../utils";

export default function RolesPanel() {
  const [roles, setRoles] = useState(initialRoles);
  const groups = groupPermissions(permissions);

  // PUT /roles/{roleId}：勾选或取消一项权限
  const toggle = (roleId: number, code: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id !== roleId
          ? role
          : {
              ...role,
              permissions: role.permissions.includes(code)
                ? role.permissions.filter((c) => c !== code)
                : [...role.permissions, code],
            },
      ),
    );
  };

  return (
    <section className="ss" id="ss-roles">
      <h2 className="ss-h">角色与权限</h2>
      <div className="scroll-x">
        <table className="tbl matrix" id="matrix">
          <thead>
            <tr>
              <th>菜单</th>
              <th>权限标识</th>
              {roles.map((role) => (
                <th className="p" key={role.id}>
                  {role.name}
                  <br />
                  <small>{role.userCount} 人</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <GroupRows
                key={group.group}
                group={group.group}
                items={group.items}
                roles={roles}
                onToggle={toggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface GroupRowsProps {
  group: string;
  items: (typeof permissions)[number][];
  roles: typeof initialRoles;
  onToggle: (roleId: number, code: string) => void;
}

function GroupRows({ group, items, roles, onToggle }: GroupRowsProps) {
  return (
    <>
      <tr className="mg">
        <td>{group}</td>
        <td colSpan={roles.length + 1} />
      </tr>
      {items.map((permission) => (
        <tr key={permission.code}>
          <td className={`l${getPermLevel(permission)}`}>{permission.name}</td>
          <td>
            <code>{permission.code}</code>
          </td>
          {roles.map((role) => (
            <td className="p" key={role.id}>
              <button
                className="pm"
                type="button"
                aria-pressed={role.permissions.includes(permission.code)}
                aria-label={`${role.name} ${permission.name}`}
                // 超级管理员的权限不能改，避免把自己锁在系统外
                disabled={role.code === "SUPER_ADMIN"}
                onClick={() => onToggle(role.id, permission.code)}
              >
                <i />
              </button>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
