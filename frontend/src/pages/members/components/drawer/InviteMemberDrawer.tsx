import React, { useState } from "react";
import Drawer from "../../../../components/Drawer";
import type { MemberPermissions, ProjectRole, UserBrief } from "../../../../types/global";
import type { PermDef } from "../../../../types/members";

interface InviteMemberDrawerProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 候选用户列表 */
  candidates: UserBrief[];
  /** 权限行列表配置 */
  permDefs: PermDef[];
  /** 确认邀请回调 */
  onSubmit: (data: {
    user: UserBrief;
    projectRole: ProjectRole;
    position: string;
    permissions: MemberPermissions;
  }) => void;
}

export default function InviteMemberDrawer({
  isOpen,
  onClose,
  candidates,
  permDefs,
  onSubmit,
}: InviteMemberDrawerProps) {
  if (!isOpen) return null;

  const [selectedUserId, setSelectedUserId] = useState<number>(
    candidates[0]?.id ?? 0,
  );
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [position, setPosition] = useState<string>("");
  const [perms, setPerms] = useState<MemberPermissions>({
    canEditTask: true,
    canEditSchedule: false,
    canEditDoc: true,
    canManageMember: false,
  });
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleRoleChange = (newRole: ProjectRole) => {
    setRole(newRole);
    if (newRole === "PM") {
      setPerms({
        canEditTask: true,
        canEditSchedule: true,
        canEditDoc: true,
        canManageMember: true,
      });
      if (!position) setPosition("项目经理");
    } else if (newRole === "TESTER") {
      setPerms((prev) => ({
        ...prev,
        canEditSchedule: false,
        canManageMember: false,
      }));
      if (!position) setPosition("测试");
    }
  };

  const handlePermToggle = (key: keyof MemberPermissions) => {
    if (role === "PM") return; // PM 默认全开不可关
    setPerms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetUser = candidates.find((c) => c.id === selectedUserId);
    if (!targetUser) {
      setErrorMsg("请选择要邀请的用户");
      return;
    }

    setErrorMsg("");
    onSubmit({
      user: targetUser,
      projectRole: role,
      position: position.trim() || (role === "PM" ? "项目经理" : role === "TESTER" ? "测试" : "开发"),
      permissions: perms,
    });
    onClose();
  };

  return (
    <Drawer className="ov fx opening invite-drawer" labelledBy="fx-title" onClose={onClose}>
      <header className="fx-head">
        <h1 className="fx-title" id="fx-title">
          邀请<em>成员</em>
        </h1>
        <button
          className="ov-close"
          type="button"
          aria-label="关闭"
          onClick={onClose}
        >
          关闭<span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="double ov-rule">
        <i />
        <i />
      </div>

      <div className="fx-body">
        <form onSubmit={handleSubmit}>
          {/* 选择用户 */}
          <div className="fr top">
            <span className="lb">
              选择用户<b>*</b>
            </span>
            {candidates.length > 0 ? (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                style={{ width: "100%", height: "36px", padding: "0 8px" }}
              >
                {candidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.realName} ({u.username})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ color: "var(--mute)", fontSize: "12px", paddingTop: "8px" }}>
                暂无可邀请的新用户（所有候选人已在项目中）
              </div>
            )}
          </div>

          {/* 项目角色 */}
          <div className="fr top">
            <span className="lb">
              项目角色<b>*</b>
            </span>
            <div className="chips" role="radiogroup" aria-label="项目角色">
              <button
                type="button"
                role="radio"
                aria-pressed={role === "MEMBER"}
                onClick={() => handleRoleChange("MEMBER")}
              >
                普通成员
              </button>
              <button
                type="button"
                role="radio"
                aria-pressed={role === "TESTER"}
                onClick={() => handleRoleChange("TESTER")}
              >
                测试人员
              </button>
              <button
                type="button"
                role="radio"
                aria-pressed={role === "PM"}
                onClick={() => handleRoleChange("PM")}
              >
                项目经理
              </button>
            </div>
          </div>

          {/* 岗位名称 */}
          <div className="fr top">
            <span className="lb">岗位名称</span>
            <input
              type="text"
              placeholder="例如：后端开发、前端开发、测试"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          {/* 初始权限分配 */}
          <div className="fr top">
            <span className="lb">初始权限</span>
            <div className="member-perm-checklist">
              {permDefs.map((def) => {
                const checked = perms[def.key];
                const disabled = role === "PM";
                return (
                  <label key={def.key} className="member-perm-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => handlePermToggle(def.key)}
                    />
                    <span>{def.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 错误提示 */}
          {errorMsg && (
            <div
              style={{
                color: "var(--signal)",
                fontSize: "12px",
                padding: "4px 0",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* 底部按钮 */}
          <div className="fx-acts">
            <button className="btn" type="button" onClick={onClose}>
              取消
            </button>
            <button
              className="btn primary go"
              type="submit"
              disabled={candidates.length === 0}
            >
              确认邀请
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}

