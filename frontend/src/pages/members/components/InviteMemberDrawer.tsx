import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/system";
import Drawer from "../../../shared/components/Drawer";
import SearchDropdown from "../../../shared/components/SearchDropdown";
import type { MemberPermissions, ProjectRole, UserBrief } from "../../../shared/types/global";
import type { MemberAdd, PermDef } from "../../../shared/types/members";

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
  // 候选人：按姓名或账号搜（GET /users/search），输入停顿后再请求，不在这里一次列出所有用户
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

  // 输入停顿 300ms 后搜；已经选了人时输入框里是他的名字，不再搜。旧请求晚到的结果丢弃
  useEffect(() => {
    const text = keyword.trim();
    if (!text || selectedUserId !== 0) return;
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const list = await userApi.search(text);
        if (stale) return;
        setFound(list);
        setErrorMsg("");
      } catch (e) {
        if (stale) return;
        setErrorMsg(e instanceof Error ? e.message : "搜索失败，请稍后再试");
      } finally {
        if (!stale) setSearching(false);
      }
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [keyword, selectedUserId]);

  const handleKeywordChange = (text: string) => {
    setKeyword(text);
    // 选中后再改输入内容，就清掉已选
    setSelectedUserId(0);
    if (text.trim()) {
      setSearching(true);
    } else {
      setSearching(false);
      setFound(null);
    }
  };

  const handlePickUser = (user: UserBrief) => {
    setSelectedUserId(user.id);
    setKeyword(`${user.realName} (${user.username})`);
    setSearching(false);
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
        <h1 className="fx-title t-overlay-title" id="fx-title">
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
            <span className="lb t-label">
              选择用户<b>*</b>
            </span>
            <div>
              <SearchDropdown
                items={candidates}
                getKey={(u) => u.id}
                onPick={handlePickUser}
                isSelected={(u) => u.id === selectedUserId}
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="输入姓名或账号搜索"
                ariaLabel="选择用户"
                headWord="USERS"
                loading={searching}
                emptyText="没有可邀请的用户"
                renderItem={(u) => (
                  <span>
                    <span className="sd-nm">{u.realName}</span>
                    <span className="sd-sub">{u.username}</span>
                  </span>
                )}
                itemClassName={() => "sd-row"}
              />
            </div>
          </div>

          {/* 项目角色 */}
          <div className="fr top">
            <span className="lb t-label">
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
          <div className="fr">
            <span className="lb t-label">岗位名称</span>
            <input
              className="u"
              type="text"
              placeholder="例如：后端开发、前端开发、测试"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          {/* 初始权限分配 */}
          <div className="fr top">
            <span className="lb t-label">初始权限</span>
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
            <div className="err t-error" role="alert">
              {errorMsg}
            </div>
          )}

          {/* 底部按钮 */}
          <div className="fx-acts">
            <button
              className="btn primary"
              type="submit"
              disabled={candidates.length === 0 || submitting}
            >
              {submitting ? "邀请中…" : "确认邀请"}
            </button>
            <button className="btn" type="button" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}

