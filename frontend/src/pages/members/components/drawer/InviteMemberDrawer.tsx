import React, { useState } from "react";
import { userApi } from "../../../../api/system";
import Drawer from "../../../../components/Drawer";
import type { MemberPermissions, ProjectRole, UserBrief } from "../../../../types/global";
import type { MemberAdd, PermDef } from "../../../../types/members";

interface InviteMemberDrawerProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 已经在项目里的用户，搜索结果里去掉 */
  memberIds: number[];
  /** 权限行列表配置 */
  permDefs: PermDef[];
  /** 确认邀请，POST /projects/{projectId}/members；失败抛错，message 显示在抽屉里 */
  onSubmit: (body: MemberAdd) => Promise<void>;
}

/** 关着时不渲染，打开时才挂上表单，每次打开都是新的表单状态 */
export default function InviteMemberDrawer(props: InviteMemberDrawerProps) {
  return props.isOpen ? <InviteMemberForm {...props} /> : null;
}

function InviteMemberForm({
  onClose,
  memberIds,
  permDefs,
  onSubmit,
}: InviteMemberDrawerProps) {
  // 候选人：按姓名或账号搜（GET /users/search），不在这里一次列出所有用户
  const [keyword, setKeyword] = useState("");
  const [found, setFound] = useState<UserBrief[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const candidates = (found ?? []).filter((u) => !memberIds.includes(u.id));
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [position, setPosition] = useState<string>("");
  const [perms, setPerms] = useState<MemberPermissions>({
    canEditTask: false,
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

  const handleSearch = async () => {
    const text = keyword.trim();
    if (!text) {
      setErrorMsg("请输入姓名或账号再搜索");
      return;
    }
    setErrorMsg("");
    setSearching(true);
    try {
      const list = await userApi.search(text);
      setFound(list);
      const first = list.find((u) => !memberIds.includes(u.id));
      setSelectedUserId(first?.id ?? 0);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "搜索失败，请稍后再试");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetUser = candidates.find((c) => c.id === selectedUserId);
    if (!targetUser) {
      setErrorMsg("请先搜索并选择要邀请的用户");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    try {
      await onSubmit({
        userId: targetUser.id,
        projectRole: role,
        position: position.trim() || (role === "PM" ? "项目经理" : role === "TESTER" ? "测试" : "开发"),
        ...perms,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "邀请失败，请稍后再试");
      setSubmitting(false);
    }
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
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="输入姓名或账号搜索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSearch();
                    }
                  }}
                />
                <button
                  className="btn"
                  type="button"
                  disabled={searching}
                  onClick={() => void handleSearch()}
                >
                  {searching ? "搜索中…" : "搜索"}
                </button>
              </div>
              {candidates.length > 0 ? (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  style={{ width: "100%", height: "36px", padding: "0 8px", marginTop: 8 }}
                >
                  {candidates.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.realName} ({u.username})
                    </option>
                  ))}
                </select>
              ) : (
                found !== null && (
                  <div style={{ color: "var(--mute)", fontSize: "12px", paddingTop: "8px" }}>
                    没有可邀请的用户（没搜到，或搜到的人已在项目中）
                  </div>
                )
              )}
            </div>
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
              disabled={candidates.length === 0 || submitting}
            >
              {submitting ? "邀请中…" : "确认邀请"}
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}

